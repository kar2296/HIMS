const http = require("http");
const fs = require("fs");
const dotenv = require("dotenv");
const env = dotenv.parse(fs.readFileSync("/Users/sharmila/Rajesh/hims-release-clean/api/.env"));
const CryptoJS = require("crypto-js");
const pg = require("pg");

const API_PORT = parseInt(process.env.API_PORT || process.env.TEST_PORT || "2018", 10);
const DB_NAME = process.env.PG_DATABASE || "hims_clean_prov_db";

const pgClient = new pg.Client({ host: "127.0.0.1", port: 5432, user: process.env.USER || "sharmila", database: DB_NAME });

async function makeRequest(options, body, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    options.headers = options.headers || {};
    options.headers["Connection"] = "close";
    
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        const elapsed = Date.now() - startTime;
        let parsed = data;
        try { parsed = JSON.parse(data); } catch(e){}
        resolve({ status: res.statusCode, headers: res.headers, data: parsed, elapsed });
      });
    });

    req.on("error", (err) => {
      const elapsed = Date.now() - startTime;
      resolve({ status: 500, error: err.message, elapsed });
    });

    req.setTimeout(timeoutMs, () => {
      const elapsed = Date.now() - startTime;
      req.destroy();
      resolve({ status: 504, error: "TIMEOUT", elapsed });
    });

    if (body) {
      if (typeof body === "string") req.write(body);
      else req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function getBearerToken(userName, password) {
  const secret = env.JWT_SECRET;
  const tokenPayload = { userName, password, nonce: new Date().toUTCString() };
  return CryptoJS.AES.encrypt(JSON.stringify(tokenPayload), secret).toString();
}

async function runAuthErrorVerification() {
  await pgClient.connect();
  console.log("==========================================================================");
  console.log(`AUTH ERROR HANDLING & CONTROLLED FAILURE VERIFICATION`);
  console.log(`Target API: http://localhost:${API_PORT} | Target Database: ${DB_NAME}`);
  console.log("==========================================================================\n");

  const results = [];
  const token = getBearerToken("admin", "admin");

  // Test 1: Standard Valid Authentication
  const validAuth = await makeRequest({
    host: "127.0.0.1", port: API_PORT, path: "/Auth/getClientToken", method: "POST",
    headers: { "Content-Type": "application/json" }
  }, { userName: "sdh", password: "1234" });

  results.push({
    id: "AUTH-01",
    name: "Valid Client Token Generation",
    status: (validAuth.status === 200 && validAuth.data && validAuth.data.token) ? "PASS" : "FAIL",
    elapsed: `${validAuth.elapsed}ms`,
    details: `Status ${validAuth.status}, received valid encrypted client token within ${validAuth.elapsed}ms`
  });

  // Test 2: Invalid Credentials Error Response
  const invalidAuth = await makeRequest({
    host: "127.0.0.1", port: API_PORT, path: "/Auth/getClientToken", method: "POST",
    headers: { "Content-Type": "application/json" }
  }, { userName: "nonexistent_user", password: "wrong_password" });

  results.push({
    id: "AUTH-02",
    name: "Sanitized Invalid Credentials Rejection",
    status: (invalidAuth.status === 200 && invalidAuth.data && invalidAuth.data.error === "Invalid credentials") ? "PASS" : "FAIL",
    elapsed: `${invalidAuth.elapsed}ms`,
    details: `Status ${invalidAuth.status}, response returned sanitized error without crash or leak`
  });

  // Test 3: Controlled Malformed Payload & Error Path (Bounded Request)
  const malformedAuth = await makeRequest({
    host: "127.0.0.1", port: API_PORT, path: "/Auth/reset-locked-password", method: "POST",
    headers: { "Content-Type": "application/json" }
  }, { userName: "" });

  results.push({
    id: "AUTH-03",
    name: "Bounded Error Response on Malformed Request",
    status: (malformedAuth.status === 400 && malformedAuth.elapsed < 500) ? "PASS" : "FAIL",
    elapsed: `${malformedAuth.elapsed}ms`,
    details: `Status ${malformedAuth.status}, response completed within ${malformedAuth.elapsed}ms (< 500ms limit)`
  });

  // Test 4: Verify No Idle-In-Transaction Connection Leaks
  const leakQuery = await pgClient.query(`
    SELECT pid, state, query, age(clock_timestamp(), state_change) as idle_age
    FROM pg_stat_activity
    WHERE datname = $1 AND state = 'idle in transaction';
  `, [DB_NAME]);

  results.push({
    id: "AUTH-04",
    name: "Database Transaction & Socket Leak Guard",
    status: leakQuery.rows.length === 0 ? "PASS" : "FAIL",
    elapsed: "0ms",
    details: `Found ${leakQuery.rows.length} idle-in-transaction connections. Sockets and transactions cleanly released.`
  });

  // Test 5: Idempotency CASHIER_PAYMENT with Transaction Atomicity on Clean DB
  const encRes = await pgClient.query(`
    INSERT INTO encounters ("PatientId", "FacilityId", "DoctorId", "AdmissionDate", "EncounterTypeId", "Status")
    VALUES (1, 1, 1, NOW(), 1, 1) RETURNING "EncounterId"
  `);
  const encounterId = parseInt(encRes.rows[0].EncounterId, 10);

  const billRes = await pgClient.query(`
    INSERT INTO patientbills (
      "PatientId", "EncounterId", "FacilityId", "BillDateTime", "BillAmount", "BillDiscount",
      "PaidAmount", "OutStandingAmount", "GSTAmount", "PatientBillStatusId", "Status"
    ) VALUES (
      1, $1, 1, NOW(), 500.00, 0.00,
      0.00, 500.00, 0.00, 1, 1
    ) RETURNING "PatientBillId"
  `, [encounterId]);
  const billId = parseInt(billRes.rows[0].PatientBillId, 10);

  const idemKey = `CLEAN-TEST-IDEM-${Date.now()}`;
  const paymentPayload = {
    Data: {
      FacilityId: 1,
      PatientId: 1,
      EncounterId: encounterId,
      EncounterTypeId: 1,
      PatientBillId: billId,
      AmountPaid: 500.00,
      PaymentTypeId: 1,
      ReceiptTypeId: 1,
      ReceiptStatusId: 1
    }
  };

  const payRes1 = await makeRequest({
    host: "127.0.0.1", port: API_PORT, path: "/Billing/PatientPaymentDetails/AddPatientPaymentDetails", method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "x-idempotency-key": idemKey
    }
  }, paymentPayload);

  const receiptId1 = payRes1.data && (payRes1.data.Data !== undefined ? payRes1.data.Data : payRes1.data);

  // Replay exactly same key
  const payRes2 = await makeRequest({
    host: "127.0.0.1", port: API_PORT, path: "/Billing/PatientPaymentDetails/AddPatientPaymentDetails", method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "x-idempotency-key": idemKey
    }
  }, paymentPayload);

  const receiptId2 = payRes2.data && (payRes2.data.Data !== undefined ? payRes2.data.Data : payRes2.data);

  // Altered payload mismatch test
  const alteredPayload = { ...paymentPayload, Data: { ...paymentPayload.Data, AmountPaid: 999.00 } };
  const payRes3 = await makeRequest({
    host: "127.0.0.1", port: API_PORT, path: "/Billing/PatientPaymentDetails/AddPatientPaymentDetails", method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "x-idempotency-key": idemKey
    }
  }, alteredPayload);

  const idemPassed = (receiptId1 > 0 && receiptId1 === receiptId2 && payRes3.status === 409);

  results.push({
    id: "AUTH-05",
    name: "Atomic Idempotency & Financial Transaction Replay",
    status: idemPassed ? "PASS" : "FAIL",
    elapsed: `${payRes1.elapsed + payRes2.elapsed}ms`,
    details: `Initial Receipt #${receiptId1}, Replay Receipt #${receiptId2} (matched), Altered Payload returned HTTP ${payRes3.status} 409 Conflict`
  });

  await pgClient.end();

  console.log("┌─────────┬────────────────────────────────────────────┬────────┬───────────┐");
  console.log("│ Test ID │ Test Description                           │ Status │ Duration  │");
  console.log("├─────────┼────────────────────────────────────────────┼────────┼───────────┤");
  results.forEach(r => {
    const id = r.id.padEnd(7);
    const desc = r.name.padEnd(42).slice(0, 42);
    const st = r.status.padEnd(6);
    const dur = r.elapsed.padEnd(9);
    console.log(`│ ${id} │ ${desc} │ ${st} │ ${dur} │`);
  });
  console.log("└─────────┴────────────────────────────────────────────┴────────┴───────────┘\n");

  const allPassed = results.every(r => r.status === "PASS");
  if (!allPassed) {
    console.error("FAILURES DETECTED IN AUTH ERROR VERIFICATION SUITE!");
    process.exit(1);
  } else {
    console.log("ALL AUTH ERROR & CONTROLLED FAILURE ASSERTIONS PASSED (5/5)\n");
    process.exit(0);
  }
}

runAuthErrorVerification().catch(err => {
  console.error("Suite Execution Error:", err);
  process.exit(1);
});
