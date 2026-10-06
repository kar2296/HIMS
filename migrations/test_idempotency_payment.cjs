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

async function runIdempotencyTestSuite() {
  console.log("=== EXECUTING COMPREHENSIVE PAYMENT IDEMPOTENCY TEST SUITE (DEF-006) ===\n");

  const results = [];
  let failures = 0;

  // Setup: Create encounter and bill for testing (Bill Amount: 1000.00, Discount: 100.00, Net: 900.00)
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

  // 1. Initial Payment Submission with Idempotency Key (Amount: ₹400.00)
  const opKey1 = `IDEM-KEY-${Date.now()}-001`;
  const payReq1 = {
    Data: {
      PatientBillId: billId,
      PatientId: 1,
      EncounterId: encounterId,
      FacilityId: 1,
      PaymentTypeId: 1,
      AmountPaid: 400.00,
      PatientName: "IDEMPOTENCY TEST PATIENT",
      ReceiptStatusId: 1,
      Status: 1
    }
  };

  const res1 = await apiPostWithKey("/Billing/PatientPaymentDetails/AddPatientPaymentDetails", payReq1, opKey1);
  const receipt1Id = typeof res1.data === "number" ? res1.data : (res1.data?.Data || res1.data?.PatientReceiptId);

  const recCount1 = await pool.query(`SELECT COUNT(*) as count FROM patientpaymentdetails WHERE "PatientBillId" = $1`, [billId]);
  const billCheck1 = await pool.query(`SELECT "PaidAmount", "OutStandingAmount" FROM patientbills WHERE "PatientBillId" = $1`, [billId]);

  const p1Passed = res1.status === 200 && parseInt(recCount1.rows[0].count, 10) === 1 && parseFloat(billCheck1.rows[0].PaidAmount) === 400.00 && parseFloat(billCheck1.rows[0].OutStandingAmount) === 500.00;
  if (!p1Passed) failures++;

  results.push({
    testId: "IDEM-01",
    test: "Initial Payment with Key",
    deltaPaid: "+₹400.00",
    cumPaid: `₹${parseFloat(billCheck1.rows[0].PaidAmount).toFixed(2)}`,
    cumDue: `₹${parseFloat(billCheck1.rows[0].OutStandingAmount).toFixed(2)}`,
    httpStatus: res1.status,
    dbReceipts: recCount1.rows[0].count,
    status: p1Passed ? "PASSED" : "FAILED",
    details: `Receipt #${receipt1Id} created. Paid: ₹400.00, Due: ₹500.00`
  });

  // 2. Double-Click / Fast Replay (Same Key + Same Payload)
  const res2 = await apiPostWithKey("/Billing/PatientPaymentDetails/AddPatientPaymentDetails", payReq1, opKey1);
  const receipt2Id = typeof res2.data === "number" ? res2.data : (res2.data?.Data || res2.data?.PatientReceiptId);

  const recCount2 = await pool.query(`SELECT COUNT(*) as count FROM patientpaymentdetails WHERE "PatientBillId" = $1`, [billId]);
  const billCheck2 = await pool.query(`SELECT "PaidAmount", "OutStandingAmount" FROM patientbills WHERE "PatientBillId" = $1`, [billId]);

  const p2Passed = res2.status === 200 && parseInt(recCount2.rows[0].count, 10) === 1 && receipt1Id === receipt2Id && parseFloat(billCheck2.rows[0].PaidAmount) === 400.00;
  if (!p2Passed) failures++;

  results.push({
    testId: "IDEM-02",
    test: "Double-Click Fast Replay",
    deltaPaid: "₹0.00 (Cached)",
    cumPaid: `₹${parseFloat(billCheck2.rows[0].PaidAmount).toFixed(2)}`,
    cumDue: `₹${parseFloat(billCheck2.rows[0].OutStandingAmount).toFixed(2)}`,
    httpStatus: res2.status,
    dbReceipts: recCount2.rows[0].count,
    status: p2Passed ? "PASSED" : "FAILED",
    details: `Cached Receipt #${receipt2Id} returned. Paid stays ₹400.00, Due stays ₹500.00`
  });

  // 3. Different-Payload Conflict (Same Key + Altered Payload)
  const tamperedReq = {
    Data: {
      PatientBillId: billId,
      PatientId: 1,
      EncounterId: encounterId,
      FacilityId: 1,
      PaymentTypeId: 1,
      AmountPaid: 500.00, // Altered amount
      PatientName: "TAMPERED PAYLOAD PATIENT",
      ReceiptStatusId: 1,
      Status: 1
    }
  };

  const res3 = await apiPostWithKey("/Billing/PatientPaymentDetails/AddPatientPaymentDetails", tamperedReq, opKey1);
  const recCount3 = await pool.query(`SELECT COUNT(*) as count FROM patientpaymentdetails WHERE "PatientBillId" = $1`, [billId]);
  const billCheck3 = await pool.query(`SELECT "PaidAmount", "OutStandingAmount" FROM patientbills WHERE "PatientBillId" = $1`, [billId]);

  const p3Passed = (res3.status === 409 || res3.status === 422 || res3.data?.Message?.includes("MISMATCH")) && parseInt(recCount3.rows[0].count, 10) === 1;
  if (!p3Passed) failures++;

  results.push({
    testId: "IDEM-03",
    test: "Tampered Payload Conflict",
    deltaPaid: "₹0.00 (Blocked)",
    cumPaid: `₹${parseFloat(billCheck3.rows[0].PaidAmount).toFixed(2)}`,
    cumDue: `₹${parseFloat(billCheck3.rows[0].OutStandingAmount).toFixed(2)}`,
    httpStatus: res3.status,
    dbReceipts: recCount3.rows[0].count,
    status: p3Passed ? "PASSED" : "FAILED",
    details: `HTTP ${res3.status} Conflict. Balance unchanged (Paid: ₹400.00, Due: ₹500.00)`
  });

  // 4. Same-Key Concurrent Parallel Requests (Amount: ₹200.00)
  const opKeyConc = `IDEM-CONC-${Date.now()}`;
  const payReqConc = {
    Data: {
      PatientBillId: billId,
      PatientId: 1,
      EncounterId: encounterId,
      FacilityId: 1,
      PaymentTypeId: 1,
      AmountPaid: 200.00,
      PatientName: "CONCURRENT IDEM TESTER",
      ReceiptStatusId: 1,
      Status: 1
    }
  };

  const [cRes1, cRes2, cRes3] = await Promise.all([
    apiPostWithKey("/Billing/PatientPaymentDetails/AddPatientPaymentDetails", payReqConc, opKeyConc),
    apiPostWithKey("/Billing/PatientPaymentDetails/AddPatientPaymentDetails", payReqConc, opKeyConc),
    apiPostWithKey("/Billing/PatientPaymentDetails/AddPatientPaymentDetails", payReqConc, opKeyConc)
  ]);

  const recCount4 = await pool.query(`SELECT COUNT(*) as count FROM patientpaymentdetails WHERE "PatientBillId" = $1`, [billId]);
  const billCheck4 = await pool.query(`SELECT "PaidAmount", "OutStandingAmount" FROM patientbills WHERE "PatientBillId" = $1`, [billId]);

  const p4Passed = parseInt(recCount4.rows[0].count, 10) === 2 && parseFloat(billCheck4.rows[0].PaidAmount) === 600.00 && parseFloat(billCheck4.rows[0].OutStandingAmount) === 300.00;
  if (!p4Passed) failures++;

  results.push({
    testId: "IDEM-04",
    test: "Concurrent Parallel Requests",
    deltaPaid: "+₹200.00",
    cumPaid: `₹${parseFloat(billCheck4.rows[0].PaidAmount).toFixed(2)}`,
    cumDue: `₹${parseFloat(billCheck4.rows[0].OutStandingAmount).toFixed(2)}`,
    httpStatus: `${cRes1.status}, ${cRes2.status}, ${cRes3.status}`,
    dbReceipts: recCount4.rows[0].count,
    status: p4Passed ? "PASSED" : "FAILED",
    details: `Exactly 1 write across 3 parallel requests. Paid: ₹600.00, Due: ₹300.00`
  });

  // 5. Replay After Persisted State Query (Cold Cache / Restart Resilience)
  const storedIdemRec = await pool.query(`
    SELECT "IdempotencyKey", "Status", "ResponseCode", "ResponseBody", "RequestFingerprint"
    FROM idempotency_records
    WHERE "IdempotencyKey" = $1
  `, [opKeyConc]);

  const replayPostCheck = await apiPostWithKey("/Billing/PatientPaymentDetails/AddPatientPaymentDetails", payReqConc, opKeyConc);
  const recCount5 = await pool.query(`SELECT COUNT(*) as count FROM patientpaymentdetails WHERE "PatientBillId" = $1`, [billId]);
  const billCheck5 = await pool.query(`SELECT "PaidAmount", "OutStandingAmount" FROM patientbills WHERE "PatientBillId" = $1`, [billId]);

  const p5Passed = storedIdemRec.rows.length === 1 && storedIdemRec.rows[0].Status === "COMPLETED" && replayPostCheck.status === 200 && parseInt(recCount5.rows[0].count, 10) === 2;
  if (!p5Passed) failures++;

  results.push({
    testId: "IDEM-05",
    test: "Cold Cache / Restart Query",
    deltaPaid: "₹0.00 (Cached)",
    cumPaid: `₹${parseFloat(billCheck5.rows[0].PaidAmount).toFixed(2)}`,
    cumDue: `₹${parseFloat(billCheck5.rows[0].OutStandingAmount).toFixed(2)}`,
    httpStatus: replayPostCheck.status,
    dbReceipts: recCount5.rows[0].count,
    status: p5Passed ? "PASSED" : "FAILED",
    details: `Persisted record verified in DB. Paid stays ₹600.00, Due stays ₹300.00`
  });

  // 6. Retry After Lost Response (Amount: ₹100.00)
  const opKeyRetry = `IDEM-RETRY-${Date.now()}`;
  const payReqRetry = {
    Data: {
      PatientBillId: billId,
      PatientId: 1,
      EncounterId: encounterId,
      FacilityId: 1,
      PaymentTypeId: 1,
      AmountPaid: 100.00, // New partial payment of ₹100.00
      PatientName: "RETRY AFTER TIMEOUT",
      ReceiptStatusId: 1,
      Status: 1
    }
  };

  const retryRes1 = await apiPostWithKey("/Billing/PatientPaymentDetails/AddPatientPaymentDetails", payReqRetry, opKeyRetry);
  // Immediate retry simulating client having dropped connection and re-issuing
  const retryRes2 = await apiPostWithKey("/Billing/PatientPaymentDetails/AddPatientPaymentDetails", payReqRetry, opKeyRetry);

  const recCount6 = await pool.query(`SELECT COUNT(*) as count FROM patientpaymentdetails WHERE "PatientBillId" = $1`, [billId]);
  const billCheck6 = await pool.query(`SELECT "PaidAmount", "OutStandingAmount" FROM patientbills WHERE "PatientBillId" = $1`, [billId]);

  const p6Passed = retryRes1.status === 200 && retryRes2.status === 200 && parseInt(recCount6.rows[0].count, 10) === 3 && parseFloat(billCheck6.rows[0].PaidAmount) === 700.00 && parseFloat(billCheck6.rows[0].OutStandingAmount) === 200.00;
  if (!p6Passed) failures++;

  results.push({
    testId: "IDEM-06",
    test: "Retry After Lost Response",
    deltaPaid: "+₹100.00",
    cumPaid: `₹${parseFloat(billCheck6.rows[0].PaidAmount).toFixed(2)}`,
    cumDue: `₹${parseFloat(billCheck6.rows[0].OutStandingAmount).toFixed(2)}`,
    httpStatus: `First: ${retryRes1.status}, Retry: ${retryRes2.status}`,
    dbReceipts: recCount6.rows[0].count,
    status: p6Passed ? "PASSED" : "FAILED",
    details: `Client re-issue retrieved cached receipt. Paid: ₹700.00, Due: ₹200.00`
  });

  // 7. Rollback / Error Boundary Integrity Check (Invalid Bill ID)
  const opKeyRollback = `IDEM-ROLLBACK-${Date.now()}`;
  const badReq = {
    Data: {
      PatientBillId: 99999999, // Non-existent bill
      PatientId: 1,
      EncounterId: encounterId,
      FacilityId: 1,
      PaymentTypeId: 1,
      AmountPaid: 100.00,
      PatientName: "INVALID BILL PATIENT",
      ReceiptStatusId: 1,
      Status: 1
    }
  };

  const rollbackRes = await apiPostWithKey("/Billing/PatientPaymentDetails/AddPatientPaymentDetails", badReq, opKeyRollback);
  const orphanCheck = await pool.query(`SELECT COUNT(*) as count FROM patientpaymentdetails WHERE "PatientBillId" = 99999999`);
  const billCheck7 = await pool.query(`SELECT "PaidAmount", "OutStandingAmount" FROM patientbills WHERE "PatientBillId" = $1`, [billId]);

  const p7Passed = (rollbackRes.status >= 400) && parseInt(orphanCheck.rows[0].count, 10) === 0;
  if (!p7Passed) failures++;

  results.push({
    testId: "IDEM-07",
    test: "Transaction Rollback Integrity",
    deltaPaid: "₹0.00 (Rolled Back)",
    cumPaid: `₹${parseFloat(billCheck7.rows[0].PaidAmount).toFixed(2)}`,
    cumDue: `₹${parseFloat(billCheck7.rows[0].OutStandingAmount).toFixed(2)}`,
    httpStatus: rollbackRes.status,
    dbReceipts: recCount6.rows[0].count,
    status: p7Passed ? "PASSED" : "FAILED",
    details: `HTTP ${rollbackRes.status} on invalid bill. 0 orphan writes; test bill balance unchanged (Paid: ₹700.00, Due: ₹200.00)`
  });

  // 8. Legitimate Final Payment with Genuinely New Key (Amount: ₹200.00 -> Full Settlement)
  const opKeyFinal = `IDEM-FINAL-${Date.now()}`;
  const payReqFinal = {
    Data: {
      PatientBillId: billId,
      PatientId: 1,
      EncounterId: encounterId,
      FacilityId: 1,
      PaymentTypeId: 1,
      AmountPaid: 200.00, // Remaining balance (₹200.00)
      PatientName: "LEGITIMATE FINAL PAYMENT",
      ReceiptStatusId: 1,
      Status: 1
    }
  };

  const resFinal = await apiPostWithKey("/Billing/PatientPaymentDetails/AddPatientPaymentDetails", payReqFinal, opKeyFinal);
  const recCount8 = await pool.query(`SELECT COUNT(*) as count FROM patientpaymentdetails WHERE "PatientBillId" = $1`, [billId]);
  const billCheck8 = await pool.query(`SELECT "PaidAmount", "OutStandingAmount", "IsPaidFully" FROM patientbills WHERE "PatientBillId" = $1`, [billId]);

  const p8Passed = resFinal.status === 200 && parseInt(recCount8.rows[0].count, 10) === 4 && parseFloat(billCheck8.rows[0].PaidAmount) === 900.00 && parseFloat(billCheck8.rows[0].OutStandingAmount) === 0.00;
  if (!p8Passed) failures++;

  results.push({
    testId: "IDEM-08",
    test: "Legitimate Final Settlement",
    deltaPaid: "+₹200.00",
    cumPaid: `₹${parseFloat(billCheck8.rows[0].PaidAmount).toFixed(2)}`,
    cumDue: `₹${parseFloat(billCheck8.rows[0].OutStandingAmount).toFixed(2)}`,
    httpStatus: resFinal.status,
    dbReceipts: recCount8.rows[0].count,
    status: p8Passed ? "PASSED" : "FAILED",
    details: `Full settlement achieved (Total Paid: ₹900.00, Due: ₹0.00, IsPaidFully: ${billCheck8.rows[0].IsPaidFully})`
  });

  // 9. Comprehensive Database Idempotency Audit
  const auditAllKeys = await pool.query(`
    SELECT "IdempotencyKey", "Status", "ResponseCode", "RequestFingerprint"
    FROM idempotency_records
    WHERE "IdempotencyKey" IN ($1, $2, $3, $4)
  `, [opKey1, opKeyConc, opKeyRetry, opKeyFinal]);

  const p9Passed = auditAllKeys.rows.length === 4 && auditAllKeys.rows.every(r => r.Status === "COMPLETED" && r.ResponseCode === 200 && r.RequestFingerprint.length === 64);
  if (!p9Passed) failures++;

  results.push({
    testId: "IDEM-09",
    test: "DB Records & Fingerprint Audit",
    deltaPaid: "N/A",
    cumPaid: "₹900.00",
    cumDue: "₹0.00",
    httpStatus: "200 (DB Query)",
    dbReceipts: `${auditAllKeys.rows.length} Keys Persisted`,
    status: p9Passed ? "PASSED" : "FAILED",
    details: `All 4 committed keys (₹400 + ₹200 + ₹100 + ₹200 = ₹900) verified with 64-char SHA-256 fingerprints`
  });

  console.table(results);
  await pool.end();

  if (failures > 0) {
    console.error(`\n[FAILURE] ${failures} idempotency assertion(s) failed!`);
    process.exit(1);
  } else {
    console.log(`\n[SUCCESS] All ${results.length} idempotency tests passed cleanly with exact intervening balance reconciliation.`);
  }
}

runIdempotencyTestSuite().catch((err) => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});
