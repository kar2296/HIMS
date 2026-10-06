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

async function runStep1() {
  console.log("=== PHASE 1: SUBMIT INITIAL PAYMENT PRIOR TO PROCESS RESTART ===");

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

  const restartKey = `RESTART-PERSIST-KEY-${Date.now()}`;
  const payPayload = {
    Data: {
      PatientBillId: billId,
      PatientId: 1,
      EncounterId: encounterId,
      FacilityId: 1,
      PaymentTypeId: 1,
      AmountPaid: 350.00,
      PatientName: "RESTART VERIFICATION PATIENT",
      ReceiptStatusId: 1,
      Status: 1
    }
  };

  const res = await apiPostWithKey("/Billing/PatientPaymentDetails/AddPatientPaymentDetails", payPayload, restartKey);
  const receiptId = typeof res.data === "number" ? res.data : (res.data?.Data || res.data?.PatientReceiptId);

  const recCount = await pool.query(`SELECT COUNT(*) as count FROM patientpaymentdetails WHERE "PatientBillId" = $1`, [billId]);
  const billCheck = await pool.query(`SELECT "PaidAmount", "OutStandingAmount" FROM patientbills WHERE "PatientBillId" = $1`, [billId]);

  console.log(`Pre-Restart Submission Result:`);
  console.log(`- Idempotency Key: ${restartKey}`);
  console.log(`- Bill ID: ${billId}, Encounter ID: ${encounterId}`);
  console.log(`- Receipt ID: ${receiptId}`);
  console.log(`- HTTP Status: ${res.status}`);
  console.log(`- DB Receipts Count: ${recCount.rows[0].count}`);
  console.log(`- Bill Balance: Paid ₹${billCheck.rows[0].PaidAmount}, Due ₹${billCheck.rows[0].OutStandingAmount}`);

  // Save state for Step 2
  fs.writeFileSync("/Users/sharmila/Rajesh/hims-pg-pilot/scratch_restart_state.json", JSON.stringify({
    restartKey,
    billId,
    encounterId,
    receiptId,
    payPayload
  }, null, 2));

  await pool.end();
}

runStep1().catch(err => {
  console.error("Step 1 error:", err);
  process.exit(1);
});
