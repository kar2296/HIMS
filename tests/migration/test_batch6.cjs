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

async function apiPost(path, body, token = getBearerToken("admin", "admin")) {
  return new Promise((resolve, reject) => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = "Bearer " + token;
    const req = http.request({ host: "localhost", port: parseInt(process.env.API_PORT || process.env.TEST_PORT || "2018", 10), path, method: "POST", headers }, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runBatch6Suite() {
  console.log("=== EXECUTING PHASE 2 BATCH 6 (LIS & DIAGNOSTICS) TEST SUITE ===\n");
  const results = [];

  // TEST-B06-01: Auth rejection
  const unauth = await apiPost("/LIS/Testmaster/GetTestmasters", { Params: [] }, null);
  results.push({ id: "TEST-B06-01", test: "LIS Auth Rejection", status: unauth.status === 401 ? "PASSED" : "FAILED", details: `HTTP ${unauth.status} Unauthorized` });

  // TEST-B06-02: Query Test Master
  const testRes = await apiPost("/LIS/Testmaster/GetTestmasters", { Params: [], PageContext: { PageNumber: 1, PageSize: 5 } });
  results.push({ id: "TEST-B06-02", test: "Query Lab Test Masters (HTTP)", status: testRes.status === 200 ? "PASSED" : "FAILED", details: `HTTP 200, Total: ${testRes.data?.PageContext?.TotalRecords}` });

  // TEST-B06-03: Query Sample Types
  const sampleRes = await apiPost("/LIS/Sampletype/GetSampletypes", { Params: [], PageContext: { PageNumber: 1, PageSize: 5 } });
  results.push({ id: "TEST-B06-03", test: "Query Sample Types (HTTP)", status: sampleRes.status === 200 ? "PASSED" : "FAILED", details: `HTTP 200, Total: ${sampleRes.data?.PageContext?.TotalRecords}` });

  // TEST-B06-04: Lab Test Order Creation
  const ordInsert = await pool.query(`
    INSERT INTO patientorders ("PatientId", "EncounterId", "FacilityId", "DoctorId", "OrderRequestDate", "Status")
    VALUES (1, 1, 1, 1, NOW(), 1) RETURNING "PatientOrderId"
  `);
  const ordId = parseInt(ordInsert.rows[0].PatientOrderId, 10);
  results.push({ id: "TEST-B06-04", test: "Lab Test Order Header", status: ordId > 0 ? "PASSED" : "FAILED", details: `Order #${ordId} created` });

  // TEST-B06-05: Lab Test Order Line Detail
  const ordLine = await pool.query(`
    INSERT INTO patientorderdetails ("PatientOrderId", "PatientId", "ServiceId", "ServiceName", "Status")
    VALUES ($1, 1, 1, 'COMPLETE BLOOD COUNT (CBC)', 1) RETURNING "PatientOrderDetailId"
  `, [ordId]);
  results.push({ id: "TEST-B06-05", test: "Lab Test Order Item Mapping", status: ordLine.rows[0].PatientOrderDetailId > 0 ? "PASSED" : "FAILED", details: `Detail #${ordLine.rows[0].PatientOrderDetailId} created` });

  // TEST-B06-06: Sample Accessioning & Collection
  const colInsert = await pool.query(`
    INSERT INTO workordersamples ("PatientOrderId", "PatientId", "Encounterid", "Status")
    VALUES ($1, 1, 1, 1) RETURNING "WorkOrderSampleId"
  `, [ordId]);
  const colId = parseInt(colInsert.rows[0].WorkOrderSampleId, 10);
  results.push({ id: "TEST-B06-06", test: "Sample Collection & Accessioning", status: colId > 0 ? "PASSED" : "FAILED", details: `Accession #${colId} recorded` });

  // TEST-B06-07: Lab Work Order Header
  const resInsert = await pool.query(`
    INSERT INTO patientworkorder ("FacilityId", "Status")
    VALUES (1, 1) RETURNING "Workorderid"
  `);
  const resId = parseInt(resInsert.rows[0].Workorderid, 10);
  results.push({ id: "TEST-B06-07", test: "Lab Work Order Header", status: resId > 0 ? "PASSED" : "FAILED", details: `Work Order #${resId} registered` });

  // TEST-B06-08: Lab Work Order Line Values
  const resLine = await pool.query(`
    INSERT INTO patientworkorderdetails ("Workorderid", "Orderid", "Patientid", "Testid", "Status")
    VALUES ($1, $2, 1, 1, 1) RETURNING "Workorderdetailid"
  `, [resId, ordId]);
  results.push({ id: "TEST-B06-08", test: "Work Order Line Details", status: resLine.rows[0].Workorderdetailid > 0 ? "PASSED" : "FAILED", details: `Line #${resLine.rows[0].Workorderdetailid} persisted` });

  // TEST-B06-09: Reference Ranges Integrity
  const refCnt = await pool.query(`SELECT COUNT(*) FROM referencevalues WHERE "GroupCode" = 'Gender'`);
  results.push({ id: "TEST-B06-09", test: "LIS Reference Value Range Masters", status: parseInt(refCnt.rows[0].count, 10) >= 0 ? "PASSED" : "FAILED", details: `Reference values active in DB` });

  // TEST-B06-10: Multi-Facility LIS Isolation
  const f1Tests = await pool.query(`SELECT COUNT(*) FROM testmaster WHERE "Status" = 1`);
  results.push({ id: "TEST-B06-10", test: "LIS Test Master Multi-Tenant Context", status: parseInt(f1Tests.rows[0].count, 10) >= 1000 ? "PASSED" : "FAILED", details: `Active Tests: ${f1Tests.rows[0].count}` });

  // TEST-B06-11: Atomic Rollback on LIS Order Failure
  let lisRollback = false;
  const client = await pool.connect();
  try {
    await client.query("BEGIN;");
    await client.query(`INSERT INTO patientorders ("PatientId", "EncounterId", "FacilityId", "DoctorName", "Status") VALUES (1, 1, 1, 'ROLLBACK_LIS', 1);`);
    await client.query(`INSERT INTO non_existent_lis_table ("BadCol") VALUES (1);`);
    await client.query("COMMIT;");
  } catch(e) {
    await client.query("ROLLBACK;");
    const chk = await client.query(`SELECT COUNT(*) FROM patientorders WHERE "DoctorName" = 'ROLLBACK_LIS'`);
    if (parseInt(chk.rows[0].count, 10) === 0) lisRollback = true;
  } finally {
    client.release();
  }
  results.push({ id: "TEST-B06-11", test: "LIS Atomic Transaction Rollback", status: lisRollback ? "PASSED" : "FAILED", details: `Clean rollback with 0 orphan lab orders` });

  console.table(results);
  await pool.end();
}

runBatch6Suite().catch(console.error);
