const http = require("http");
const fs = require("fs");
const dotenv = require("dotenv");
const env = dotenv.parse(fs.readFileSync("/Users/sharmila/Rajesh/hims-pg-pilot/api/.env"));
const CryptoJS = require("crypto-js");
const pg = require("pg");

const pool = new pg.Pool({ host: "localhost", port: 5432, user: process.env.USER || "sharmila", database: "hims_pilot_db", max: 10 });

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
      port: 2014,
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

async function runStep2() {
  console.log("=== PHASE 2: EXECUTE POST-RESTART IDEMPOTENCY REPLAY AUDIT ===");

  const state = JSON.parse(fs.readFileSync("/Users/sharmila/Rajesh/hims-pg-pilot/scratch_restart_state.json", "utf8"));
  const { restartKey, billId, encounterId, receiptId, payPayload } = state;

  console.log(`Auditing key: ${restartKey} against newly restarted API process...`);

  // 1. Re-submit IDENTICAL payment request to restarted API
  const res = await apiPostWithKey("/Billing/PatientPaymentDetails/AddPatientPaymentDetails", payPayload, restartKey);
  const replayedReceiptId = typeof res.data === "number" ? res.data : (res.data?.Data || res.data?.PatientReceiptId);

  const recCount = await pool.query(`SELECT COUNT(*) as count FROM patientpaymentdetails WHERE "PatientBillId" = $1`, [billId]);
  const billCheck = await pool.query(`SELECT "PaidAmount", "OutStandingAmount" FROM patientbills WHERE "PatientBillId" = $1`, [billId]);

  console.log(`\nPost-Restart Replay Results:`);
  console.log(`- Pre-Restart Receipt ID: ${receiptId}`);
  console.log(`- Replayed Receipt ID: ${replayedReceiptId}`);
  console.log(`- HTTP Status: ${res.status}`);
  console.log(`- Total DB Receipts on Bill: ${recCount.rows[0].count} (Expected: exactly 1)`);
  console.log(`- Bill Balance: Paid ₹${billCheck.rows[0].PaidAmount}, Due ₹${billCheck.rows[0].OutStandingAmount} (Expected: Paid ₹350.00, Due ₹550.00)`);

  const replaySuccess = (res.status === 200) && (replayedReceiptId === receiptId) && (parseInt(recCount.rows[0].count, 10) === 1) && (parseFloat(billCheck.rows[0].PaidAmount) === 350.00);

  // 2. Test tampered payload post-restart
  const tamperedPayload = JSON.parse(JSON.stringify(payPayload));
  tamperedPayload.Data.AmountPaid = 999.00;

  const conflictRes = await apiPostWithKey("/Billing/PatientPaymentDetails/AddPatientPaymentDetails", tamperedPayload, restartKey);
  const conflictSuccess = (conflictRes.status === 409 || conflictRes.status === 422 || conflictRes.data?.Message?.includes("MISMATCH"));

  console.log(`\nPost-Restart Tampered Payload Rejection:`);
  console.log(`- HTTP Status: ${conflictRes.status} (Expected: 409 Conflict)`);
  console.log(`- Tamper Protection Success: ${conflictSuccess}`);

  await pool.end();

  if (!replaySuccess || !conflictSuccess) {
    console.error("\n[FAILED] Post-restart idempotency verification failed!");
    process.exit(1);
  } else {
    console.log("\n[PASSED] ACTUAL PILOT API RESTART IDEMPOTENCY REPLAY VERIFIED 100%!");
  }
}

runStep2().catch(err => {
  console.error("Step 2 error:", err);
  process.exit(1);
});
