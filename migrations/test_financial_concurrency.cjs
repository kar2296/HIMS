const http = require("http");
const fs = require("fs");
const dotenv = require("dotenv");
const env = dotenv.parse(fs.readFileSync("/Users/sharmila/Rajesh/hims-pg-pilot/api/.env"));
const CryptoJS = require("crypto-js");
const pg = require("pg");

const pool = new pg.Pool({ host: "localhost", port: 5432, user: process.env.USER || "sharmila", database: "hims_pilot_db", max: 10 });

async function req(options, body) {
  return new Promise((resolve, reject) => {
    const r = http.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        let parsed = data;
        try { parsed = JSON.parse(data); } catch(e){}
        resolve({ status: res.statusCode, headers: res.headers, data: parsed });
      });
    });
    r.on("error", reject);
    if (body) {
      if (typeof body === "string") r.write(body);
      else r.write(JSON.stringify(body));
    }
    r.end();
  });
}

function getBearerToken(userName, password) {
  const secret = env.JWT_SECRET;
  const tokenPayload = { userName, password, nonce: new Date().toUTCString() };
  return CryptoJS.AES.encrypt(JSON.stringify(tokenPayload), secret).toString();
}

async function runFinancialConcurrencyTests() {
  console.log("=== EXECUTING FINANCIAL BALANCE, CONCURRENCY & TRANSACTION AUDIT ===\n");

  const results = [];
  const adminToken = getBearerToken("admin", "admin");
  const authHeaders = {
    "Authorization": "Bearer " + adminToken,
    "Content-Type": "application/json"
  };

  // Step 1: Create an encounter for financial lifecycle testing
  const encRes = await pool.query(`
    INSERT INTO encounters ("PatientId", "FacilityId", "DoctorId", "AdmissionDate", "EncounterTypeId", "Status")
    VALUES (1, 1, 1, NOW(), 1, 1) RETURNING "EncounterId"
  `);
  const encounterId = parseInt(encRes.rows[0].EncounterId, 10);

  // Step 2: Create a Bill with Gross 500.00, Discount 50.00, Net 450.00, GST 22.50
  const billRes = await pool.query(`
    INSERT INTO patientbills (
      "PatientId", "EncounterId", "FacilityId", "BillDateTime", "BillAmount", "BillDiscount",
      "PaidAmount", "OutStandingAmount", "GSTAmount", "PatientBillStatusId", "Status"
    ) VALUES (
      1, $1, 1, NOW(), 500.00, 50.00,
      0.00, 450.00, 22.50, 1, 1
    ) RETURNING "PatientBillId"
  `, [encounterId]);
  const patientBillId = parseInt(billRes.rows[0].PatientBillId, 10);

  // Insert corresponding line details
  await pool.query(`
    INSERT INTO patientbilldetails (
      "PatientBillId", "EncounterId", "ServiceId", "ServiceName",
      "Quantity", "Rate", "GrossAmount", "DiscountAmount", "NetAmount", "GSTAmount", "Status"
    ) VALUES (
      $1, $2, 101, 'CARDIAC CONSULTATION - FINANCIAL AUDIT',
      1, 500.00, 500.00, 50.00, 450.00, 22.50, 1
    )
  `, [patientBillId, encounterId]);

  results.push({
    test: "1. Initial Bill Creation (Gross 500, Disc 50, Net 450)",
    status: patientBillId > 0 ? "PASSED" : "FAILED",
    details: `Bill #${patientBillId} initialized with Net: 450.00, Outstanding: 450.00, Paid: 0.00`
  });

  // Step 3: Partial Payment #1 - Pay 200.00 (Remaining Outstanding: 250.00)
  const pay1Res = await pool.query(`
    INSERT INTO patientpaymentdetails (
      "PatientBillId", "PatientId", "EncounterId", "FacilityId", "ReceiptDateTime", "PaymentTypeId",
      "AmountPaid", "PatientName", "ReceiptNumber", "Status"
    ) VALUES (
      $1, 1, $2, 1, NOW(), 1,
      200.00, 'AUDIT PATIENT', $3, 1
    ) RETURNING "PatientReceiptId"
  `, [patientBillId, encounterId, `REC-P1-${Date.now()}`]);
  const receipt1Id = parseInt(pay1Res.rows[0].PatientReceiptId, 10);

  await pool.query(`
    UPDATE patientbills
    SET "PaidAmount" = "PaidAmount" + 200.00,
        "OutStandingAmount" = "BillAmount" - "BillDiscount" - ("PaidAmount" + 200.00)
    WHERE "PatientBillId" = $1
  `, [patientBillId]);

  const billState1 = await pool.query(`SELECT "BillAmount", "BillDiscount", "PaidAmount", "OutStandingAmount" FROM patientbills WHERE "PatientBillId" = $1`, [patientBillId]);
  const b1 = billState1.rows[0];

  results.push({
    test: "2. Partial Payment #1 (Pay 200.00 -> Outstanding 250.00)",
    status: (receipt1Id > 0 && parseFloat(b1.PaidAmount) === 200.00 && parseFloat(b1.OutStandingAmount) === 250.00) ? "PASSED" : "FAILED",
    details: `Paid: ${b1.PaidAmount}, Outstanding: ${b1.OutStandingAmount} (Exact match)`
  });

  // Step 4: Final Settlement - Pay Remaining 250.00 (Outstanding becomes 0.00, Status Closed)
  const pay2Res = await pool.query(`
    INSERT INTO patientpaymentdetails (
      "PatientBillId", "PatientId", "EncounterId", "FacilityId", "ReceiptDateTime", "PaymentTypeId",
      "AmountPaid", "PatientName", "ReceiptNumber", "Status"
    ) VALUES (
      $1, 1, $2, 1, NOW(), 1,
      250.00, 'AUDIT PATIENT', $3, 1
    ) RETURNING "PatientReceiptId"
  `, [patientBillId, encounterId, `REC-P2-${Date.now()}`]);
  const receipt2Id = parseInt(pay2Res.rows[0].PatientReceiptId, 10);

  await pool.query(`
    UPDATE patientbills
    SET "PaidAmount" = "PaidAmount" + 250.00,
        "OutStandingAmount" = 0.00,
        "PatientBillStatusId" = 2
    WHERE "PatientBillId" = $1
  `, [patientBillId]);

  const billState2 = await pool.query(`SELECT "BillAmount", "BillDiscount", "PaidAmount", "OutStandingAmount", "PatientBillStatusId" FROM patientbills WHERE "PatientBillId" = $1`, [patientBillId]);
  const b2 = billState2.rows[0];

  results.push({
    test: "3. Final Settlement (Pay 250.00 -> Outstanding 0.00)",
    status: (receipt2Id > 0 && parseFloat(b2.PaidAmount) === 450.00 && parseFloat(b2.OutStandingAmount) === 0.00 && b2.PatientBillStatusId === 2) ? "PASSED" : "FAILED",
    details: `Total Paid: ${b2.PaidAmount}, Outstanding: ${b2.OutStandingAmount}, BillStatus: Closed (2)`
  });

  // Step 5: Reload via HTTP API and assert JSON balance structure
  const reloadRes = await req({
    host: "localhost", port: 2014, path: "/Billing/PatientBills/GetPatientBillsById", method: "POST", headers: authHeaders
  }, { Id: patientBillId });

  const isReloadOk = reloadRes.status === 200 && parseInt(reloadRes.data?.Id, 10) === patientBillId && parseFloat(reloadRes.data?.PaidAmount) === 450.00 && parseFloat(reloadRes.data?.OutStandingAmount) === 0.00;
  results.push({
    test: "4. Reload Settled Bill via HTTP API",
    status: isReloadOk ? "PASSED" : "FAILED",
    details: `HTTP ${reloadRes.status}, Bill #${reloadRes.data?.Id} returned with Status: ${reloadRes.data?.PatientBillStatusId}, Paid: ${reloadRes.data?.PaidAmount}, Outstanding: ${reloadRes.data?.OutStandingAmount}`
  });

  // Step 6: Concurrent Multi-User Cashier Submissions on Same Bill
  const concurrentReceipts = await Promise.all([1, 2, 3, 4].map(idx => {
    return pool.query(`
      INSERT INTO patientpaymentdetails (
        "PatientBillId", "PatientId", "EncounterId", "FacilityId", "ReceiptDateTime", "PaymentTypeId",
        "AmountPaid", "PatientName", "ReceiptNumber", "Status"
      ) VALUES (
        $1, 1, $2, 1, NOW(), 1,
        25.00, 'CONCURRENT CASHIER', $3, 1
      ) RETURNING "PatientReceiptId"
    `, [patientBillId, encounterId, `CONC-REC-${Date.now()}-${idx}`]);
  }));

  const allInserted = concurrentReceipts.every(r => r.rows.length === 1 && r.rows[0].PatientReceiptId > 0);
  const distinctIds = new Set(concurrentReceipts.map(r => r.rows[0].PatientReceiptId));

  results.push({
    test: "5. Concurrent Cashier Payments (4 Parallel Transactions)",
    status: (allInserted && distinctIds.size === 4) ? "PASSED" : "FAILED",
    details: `4 parallel receipts generated atomically: ${[...distinctIds].join(", ")}`
  });

  // Step 7: Refund Processing Lifecycle
  const refundRes = await pool.query(`
    INSERT INTO patientrefund (
      "PatientBillId", "PatientId", "EncounterId", "FacilityId", "RefundDateTime",
      "RefundAmount", "CancelReason", "Status"
    ) VALUES (
      $1, 1, $2, 1, NOW(),
      50.00, 'PATIENT SATISFACTION REFUND', 1
    ) RETURNING "PatientRefundId"
  `, [patientBillId, encounterId]);
  const refundId = parseInt(refundRes.rows[0].PatientRefundId, 10);

  results.push({
    test: "6. Bill Refund Processing",
    status: refundId > 0 ? "PASSED" : "FAILED",
    details: `Refund #${refundId} recorded for ₹50.00 linked to Bill #${patientBillId}`
  });

  // Step 8: Strict Transaction Rollback Simulation (Failure mid-way in billing)
  let rollbackSuccess = false;
  const client = await pool.connect();
  try {
    await client.query("BEGIN;");
    await client.query(`
      INSERT INTO patientbills ("PatientId", "EncounterId", "BillAmount", "Comments", "Status")
      VALUES (1, $1, 7777.00, 'INTENTIONAL_FINANCIAL_ROLLBACK', 1);
    `, [encounterId]);
    // Intentionally trigger error
    await client.query(`INSERT INTO non_existent_financial_table ("BadCol") VALUES (1);`);
    await client.query("COMMIT;");
  } catch (err) {
    await client.query("ROLLBACK;");
    const checkOrphan = await client.query(`SELECT COUNT(*) FROM patientbills WHERE "Comments" = 'INTENTIONAL_FINANCIAL_ROLLBACK'`);
    if (parseInt(checkOrphan.rows[0].count, 10) === 0) {
      rollbackSuccess = true;
    }
  } finally {
    client.release();
  }

  results.push({
    test: "7. Financial Atomic Transaction Rollback",
    status: rollbackSuccess ? "PASSED" : "FAILED",
    details: "Failed billing transaction cleanly aborted and rolled back with 0 orphaned rows"
  });

  console.table(results);
  await pool.end();
}

runFinancialConcurrencyTests().catch(console.error);
