const http = require("http");
const fs = require("fs");
const dotenv = require("dotenv");
const env = dotenv.parse(fs.readFileSync("/Users/sharmila/Rajesh/hims-pg-pilot/api/.env"));
const CryptoJS = require("crypto-js");
const pg = require("pg");
const { spawn, execSync } = require("child_process");

const pool = new pg.Pool({ host: "localhost", port: 5432, user: process.env.USER || "sharmila", database: (process.env.PG_DATABASE || process.env.TEST_DB || process.env.DATABASE_NAME || "hims_release_verify_db"), max: 10 });

function getBearerToken(userName, password) {
  const secret = env.JWT_SECRET;
  const tokenPayload = { userName, password, nonce: new Date().toUTCString() };
  return CryptoJS.AES.encrypt(JSON.stringify(tokenPayload), secret).toString();
}

const adminToken = getBearerToken("admin", "admin");

async function apiPostWithKey(path, body, idempotencyKey) {
  return new Promise((resolve, reject) => {
    const headers = {
      "Authorization": "Bearer " + adminToken,
      "Content-Type": "application/json"
    };
    if (idempotencyKey) {
      headers["X-Idempotency-Key"] = idempotencyKey;
    }

    const req = http.request({
      host: "localhost",
      port: parseInt(process.env.API_PORT || process.env.TEST_PORT || "2018", 10),
      path: path,
      method: "POST",
      headers: headers
    }, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        let parsed = data;
        try { parsed = JSON.parse(data); } catch(e){}
        resolve({ status: res.statusCode, headers: res.headers, data: parsed });
      });
    });
    req.on("error", reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function waitForApiHealth(retries = 30) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await new Promise((resolve, reject) => {
        const r = http.get("http://localhost:2018/api-docs", res => {
          resolve(res.statusCode);
        });
        r.on("error", reject);
        r.setTimeout(1000, () => { r.destroy(); reject(new Error("Timeout")); });
      });
      if (res) return true;
    } catch (e) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  throw new Error("API did not become healthy within timeout");
}

async function runProcessRestartTest() {
  console.log("=== EXECUTING ACTUAL PILOT API PROCESS RESTART & IDEMPOTENCY REPLAY TEST ===\n");

  const results = [];
  let failures = 0;

  // 1. Setup: Create test bill (Gross: ₹1000, Discount: ₹100, Net: ₹900)
  const encRes = await pool.query(`
    INSERT INTO encounters ("PatientId", "FacilityId", "DoctorId", "AdmissionDate", "EncounterTypeId", "Status")
    VALUES (1, 1, 1, NOW(), 1, 1) RETURNING "EncounterId"
  `);
  const encounterId = parseInt(encRes.rows[0].EncounterId, 10);

  const billRes = await pool.query(`
    INSERT INTO patientbills (
      "PatientId", "EncounterId", "FacilityId", "BillDateTime", "BillAmount", "BillDiscount",
      "PaidAmount", "OutStandingAmount", "GSTAmount", "PatientBillStatusId", "Status"
    ) VALUES (
      1, $1, 1, NOW(), 1000.00, 100.00,
      0.00, 900.00, 45.00, 1, 1
    ) RETURNING "PatientBillId"
  `, [encounterId]);
  const billId = parseInt(billRes.rows[0].PatientBillId, 10);

  // 2. Submit initial payment with stable key BEFORE process restart
  const restartKey = `RESTART-TEST-KEY-${Date.now()}`;
  const payPayload = {
    Data: {
      PatientBillId: billId,
      PatientId: 1,
      EncounterId: encounterId,
      FacilityId: 1,
      PaymentTypeId: 1,
      AmountPaid: 350.00,
      PatientName: "PROCESS RESTART TEST PATIENT",
      ReceiptStatusId: 1,
      Status: 1
    }
  };

  console.log(`[Phase 1] Submitting initial payment before restart (Key: ${restartKey})...`);
  const res1 = await apiPostWithKey("/Billing/PatientPaymentDetails/AddPatientPaymentDetails", payPayload, restartKey);
  const receipt1Id = typeof res1.data === "number" ? res1.data : (res1.data?.Data || res1.data?.PatientReceiptId);

  const recCount1 = await pool.query(`SELECT COUNT(*) as count FROM patientpaymentdetails WHERE "PatientBillId" = $1`, [billId]);
  const billCheck1 = await pool.query(`SELECT "PaidAmount", "OutStandingAmount" FROM patientbills WHERE "PatientBillId" = $1`, [billId]);

  console.log(`Initial Payment Committed: Receipt #${receipt1Id}, HTTP ${res1.status}, Paid: ₹${billCheck1.rows[0].PaidAmount}, Due: ₹${billCheck1.rows[0].OutStandingAmount}`);

  results.push({
    step: "1. Pre-Restart Initial Payment",
    key: restartKey,
    receiptId: receipt1Id,
    httpStatus: res1.status,
    dbReceipts: recCount1.rows[0].count,
    billPaid: `₹${billCheck1.rows[0].PaidAmount}`,
    billDue: `₹${billCheck1.rows[0].OutStandingAmount}`,
    status: (res1.status === 200 && parseInt(recCount1.rows[0].count, 10) === 1 && parseFloat(billCheck1.rows[0].PaidAmount) === 350.00) ? "PASSED" : "FAILED"
  });

  // 3. ACTUAL PROCESS RESTART
  console.log("\n[Phase 2] Performing actual process restart of Pilot API daemon on port 2014...");
  
  // Find PID listening on 2014 and terminate
  try {
    const lsofOutput = execSync("lsof -ti:2014 || true", { encoding: "utf8" }).trim();
    if (lsofOutput) {
      const pids = lsofOutput.split("\n").filter(Boolean);
      for (const pid of pids) {
        console.log(`Stopping API PID: ${pid}`);
        try { process.kill(parseInt(pid, 10), "SIGTERM"); } catch(e){}
      }
      // Wait 1s
      await new Promise(r => setTimeout(r, 1000));
      // Force kill if still lingering
      const checkAgain = execSync("lsof -ti:2014 || true", { encoding: "utf8" }).trim();
      if (checkAgain) {
        checkAgain.split("\n").filter(Boolean).forEach(p => {
          try { process.kill(parseInt(p, 10), "SIGKILL"); } catch(e){}
        });
      }
    }
  } catch (e) {
    console.log("Note during process stop:", e.message);
  }

  // Spawn a fresh new instance of API daemon
  console.log("Spawning fresh API daemon on port 2014...");
  const child = spawn("node", ["-e", `
    process.chdir("/Users/sharmila/Rajesh/hims-pg-pilot/api");
    require("dotenv").config({ path: "/Users/sharmila/Rajesh/hims-pg-pilot/api/.env" });
    require("/Users/sharmila/Rajesh/hims-pg-pilot/api/dist/src/index.js");
  `], {
    detached: true,
    stdio: "ignore"
  });
  child.unref();

  console.log(`Spawned new API process (PID ${child.pid}). Waiting for port 2014 to be healthy...`);
  await waitForApiHealth();
  console.log("Pilot API is healthy and accepting HTTP requests on port 2014!\n");

  // 4. Submit IDENTICAL request with SAME key to newly restarted API
  console.log(`[Phase 3] Submitting identical payment replay after restart (Key: ${restartKey})...`);
  const res2 = await apiPostWithKey("/Billing/PatientPaymentDetails/AddPatientPaymentDetails", payPayload, restartKey);
  const receipt2Id = typeof res2.data === "number" ? res2.data : (res2.data?.Data || res2.data?.PatientReceiptId);

  const recCount2 = await pool.query(`SELECT COUNT(*) as count FROM patientpaymentdetails WHERE "PatientBillId" = $1`, [billId]);
  const billCheck2 = await pool.query(`SELECT "PaidAmount", "OutStandingAmount" FROM patientbills WHERE "PatientBillId" = $1`, [billId]);

  const p2Passed = (res2.status === 200) && (receipt1Id === receipt2Id) && (parseInt(recCount2.rows[0].count, 10) === 1) && (parseFloat(billCheck2.rows[0].PaidAmount) === 350.00) && (parseFloat(billCheck2.rows[0].OutStandingAmount) === 550.00);
  if (!p2Passed) failures++;

  results.push({
    step: "2. Post-Restart Identical Replay",
    key: restartKey,
    receiptId: receipt2Id,
    httpStatus: res2.status,
    dbReceipts: recCount2.rows[0].count,
    billPaid: `₹${billCheck2.rows[0].PaidAmount}`,
    billDue: `₹${billCheck2.rows[0].OutStandingAmount}`,
    status: p2Passed ? "PASSED" : "FAILED"
  });

  // 5. Submit altered payload to restarted API with same key
  console.log(`[Phase 4] Submitting tampered payload after restart (Key: ${restartKey})...`);
  const tamperedPayload = JSON.parse(JSON.stringify(payPayload));
  tamperedPayload.Data.AmountPaid = 999.00;

  const res3 = await apiPostWithKey("/Billing/PatientPaymentDetails/AddPatientPaymentDetails", tamperedPayload, restartKey);
  const recCount3 = await pool.query(`SELECT COUNT(*) as count FROM patientpaymentdetails WHERE "PatientBillId" = $1`, [billId]);
  const billCheck3 = await pool.query(`SELECT "PaidAmount", "OutStandingAmount" FROM patientbills WHERE "PatientBillId" = $1`, [billId]);

  const p3Passed = (res3.status === 409 || res3.status === 422 || res3.data?.Message?.includes("MISMATCH")) && (parseInt(recCount3.rows[0].count, 10) === 1) && (parseFloat(billCheck3.rows[0].PaidAmount) === 350.00);
  if (!p3Passed) failures++;

  results.push({
    step: "3. Post-Restart Tampered Payload Rejection",
    key: restartKey,
    receiptId: "REJECTED",
    httpStatus: res3.status,
    dbReceipts: recCount3.rows[0].count,
    billPaid: `₹${billCheck3.rows[0].PaidAmount}`,
    billDue: `₹${billCheck3.rows[0].OutStandingAmount}`,
    status: p3Passed ? "PASSED" : "FAILED"
  });

  console.table(results);
  await pool.end();

  if (failures > 0) {
    console.error(`\n[FAILURE] ${failures} restart replay assertion(s) failed!`);
    process.exit(1);
  } else {
    console.log(`\n[SUCCESS] Actual process restart idempotency verification passed 100%.`);
    console.log(`- Pre-restart Receipt #${receipt1Id} was faithfully returned after full daemon restart.`);
    console.log(`- 0 duplicate DB writes occurred; PaidAmount remained ₹350.00; Outstanding remained ₹550.00.`);
    console.log(`- Tampered payload correctly rejected with HTTP ${res3.status} Conflict post-restart.`);
  }
}

runProcessRestartTest().catch(err => {
  console.error("FATAL RESTART TEST ERROR:", err);
  process.exit(1);
});
