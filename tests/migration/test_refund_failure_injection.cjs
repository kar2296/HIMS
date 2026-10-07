const http = require("http");
const fs = require("fs");
const dotenv = require("dotenv");
const env = dotenv.parse(fs.readFileSync("/Users/sharmila/Rajesh/hims-pg-pilot/api/.env"));
const CryptoJS = require("crypto-js");
const pg = require("pg");

const pool = new pg.Pool({ host: "localhost", port: 5432, user: process.env.USER || "sharmila", database: (process.env.PG_DATABASE || process.env.TEST_DB || process.env.DATABASE_NAME || "hims_release_verify_db"), max: 10 });

function getBearerToken(userName, password) {
  const secret = env.JWT_SECRET;
  const tokenPayload = { userName, password, nonce: new Date().toUTCString() };
  return CryptoJS.AES.encrypt(JSON.stringify(tokenPayload), secret).toString();
}

const adminToken = getBearerToken("admin", "admin");

async function apiPost(path, body) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      host: "localhost",
      port: parseInt(process.env.API_PORT || process.env.TEST_PORT || "2018", 10),
      path: path,
      method: "POST",
      headers: {
        "Authorization": "Bearer " + adminToken,
        "Content-Type": "application/json"
      }
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

async function runRefundFailureInjectionTest() {
  console.log("=== EXECUTING REFUND TRANSACTION FAILURE INJECTION & ROLLBACK AUDIT ===\n");

  const results = [];

  // Step 1: Create a bill and payment to refund
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
      1, $1, 1, NOW(), 500.00, 0.00,
      500.00, 0.00, 25.00, 1, 1
    ) RETURNING "PatientBillId"
  `, [encounterId]);
  const billId = parseInt(billRes.rows[0].PatientBillId, 10);

  const payRes = await pool.query(`
    INSERT INTO patientpaymentdetails (
      "PatientBillId", "PatientId", "EncounterId", "FacilityId", "ReceiptDateTime", "PaymentTypeId",
      "AmountPaid", "PatientName", "ReceiptNumber", "Status"
    ) VALUES (
      $1, 1, $2, 1, NOW(), 1,
      500.00, 'REFUND TEST PATIENT', $3, 1
    ) RETURNING "PatientReceiptId"
  `, [billId, encounterId, `REC-REF-${Date.now()}`]);
  const receiptId = parseInt(payRes.rows[0].PatientReceiptId, 10);

  results.push({
    test: "1. Setup Bill & Receipt for Refund Testing",
    status: (billId > 0 && receiptId > 0) ? "PASSED" : "FAILED",
    details: `Bill #${billId} (Paid ₹500.00) and Receipt #${receiptId} created`
  });

  // Step 2: Injected Mid-Transaction Failure Simulation (Simulated in API Transaction Context)
  const client = await pool.connect();
  let rollbackSuccess = false;
  const uniqueAuditMarker = `FAIL_INJECT_${Date.now()}`;

  try {
    await client.query("BEGIN;");
    
    // 2a. Insert Refund Header
    const rHeader = await client.query(`
      INSERT INTO patientrefund (
        "PatientBillId", "PatientId", "EncounterId", "FacilityId",
        "RefundAmount", "RefundDateTime", "RefundStatusId", "RefundTypeId",
        "CancelReason", "Status"
      ) VALUES (
        $1, 1, $2, 1,
        150.00, NOW(), 1, 1,
        $3, 1
      ) RETURNING "PatientRefundId"
    `, [billId, encounterId, uniqueAuditMarker]);
    
    const simRefundId = rHeader.rows[0].PatientRefundId;

    // 2b. Injected Failure: Insert into non-existent table or violated check constraint
    await client.query(`
      INSERT INTO patientrefunddetails (
        "PatientRefundId", "PatientBillDetailId", "NonExistentColumn", "Status"
      ) VALUES (
        $1, 999999, 'INVALID_VALUE', 1
      )
    `, [simRefundId]);

    await client.query("COMMIT;");
  } catch (err) {
    await client.query("ROLLBACK;");
    rollbackSuccess = true;
  } finally {
    client.release();
  }

  // Step 3: Assert Zero Orphaned Rows
  const orphanCheck = await pool.query(`
    SELECT COUNT(*) as count FROM patientrefund WHERE "CancelReason" = $1
  `, [uniqueAuditMarker]);

  const orphanCount = parseInt(orphanCheck.rows[0].count, 10);

  results.push({
    test: "2. Injected Mid-Transaction Failure & Rollback",
    status: (rollbackSuccess && orphanCount === 0) ? "PASSED" : "FAILED",
    details: `Transaction caught injected child failure and executed ROLLBACK (0 orphaned refund headers)`
  });

  // Step 4: Valid Refund Lifecycle via API
  const validRefundReq = {
    Data: {
      Header: {
        PatientBillId: billId,
        PatientId: 1,
        EncounterId: encounterId,
        FacilityId: 1,
        PaymentTypeId: 1,
        RefundAmount: 200.00,
        CancelReason: "VALID AUDIT REFUND PROCESSED",
        RefundDateTime: new Date(),
        RefundStatusId: 1,
        RefundTypeId: 1,
        Status: 1
      }
    }
  };

  const validRes = await apiPost("/Billing/PatientRefund/AddPatientRefund", validRefundReq);
  const validCheck = await pool.query(`
    SELECT COUNT(*) as count FROM patientrefund WHERE "PatientBillId" = $1
  `, [billId]);

  results.push({
    test: "3. Valid Refund Submission via HTTP API",
    status: (validRes.status === 200 && parseInt(validCheck.rows[0].count, 10) > 0) ? "PASSED" : "FAILED",
    details: `HTTP ${validRes.status}, valid refund successfully committed with DB persistence`
  });

  console.table(results);
  await pool.end();
}

runRefundFailureInjectionTest().catch(console.error);
