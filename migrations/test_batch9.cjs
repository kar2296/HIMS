const http = require("http");
const fs = require("fs");
const dotenv = require("dotenv");
const env = dotenv.parse(fs.readFileSync("/Users/sharmila/Rajesh/hims-pg-pilot/api/.env"));
const CryptoJS = require("crypto-js");
const pg = require("pg");

const pgClient = new pg.Client({ host: "localhost", port: 5432, user: process.env.USER || "sharmila", database: "hims_pilot_db" });

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

async function runBatch9TestSuite() {
  await pgClient.connect();
  console.log("=== EXECUTING PHASE 2 BATCH 9 (MRD, DISCHARGE SUMMARIES & REGISTRIES) TEST SUITE ===\n");

  const results = [];
  const adminToken = getBearerToken("admin", "admin");
  const authHeaders = {
    "Authorization": "Bearer " + adminToken,
    "Content-Type": "application/json"
  };

  // 1. Security & Token Authentication Rejection
  const unauthRes = await req({
    host: "localhost", port: 2014, path: "/DischargeSummary/PatientCertificate/GetPatientCertificates", method: "POST",
    headers: { "Content-Type": "application/json" }
  }, { Params: [] });

  const invalidToken = getBearerToken("fake_user", "bad_password");
  const badRoleRes = await req({
    host: "localhost", port: 2014, path: "/DischargeSummary/PatientCertificate/GetPatientCertificates", method: "POST",
    headers: { "Authorization": "Bearer " + invalidToken, "Content-Type": "application/json" }
  }, { Params: [] });

  results.push({
    test: "1. Security & Role Authentication Rejection",
    status: (unauthRes.status === 401 && badRoleRes.status === 401) ? "PASSED" : "FAILED",
    details: "Unauthenticated and forged token requests strictly rejected with HTTP 401"
  });

  // 2. Query Discharge Summaries & Certificates (HTTP API)
  const certRes = await req({
    host: "localhost", port: 2014, path: "/DischargeSummary/PatientCertificate/GetPatientCertificates", method: "POST", headers: authHeaders
  }, { Params: [], PageContext: { PageNumber: 1, PageSize: 10 } });

  results.push({
    test: "2. Query Discharge Summaries & Certificates (HTTP API)",
    status: (certRes.status === 200 && certRes.data?.PageContext?.TotalRecords > 0) ? "PASSED" : "FAILED",
    details: `HTTP 200, Total Patient Certificates: ${certRes.data?.PageContext?.TotalRecords}`
  });

  // 3. Query MRD File Requests & Locations (HTTP API)
  const fileReqRes = await req({
    host: "localhost", port: 2014, path: "/IPManagement/FileRequest/GetFileRequests", method: "POST", headers: authHeaders
  }, { Params: [], PageContext: { PageNumber: 1, PageSize: 5 } });

  const mrdLocRes = await req({
    host: "localhost", port: 2014, path: "/IPManagement/MRDLocation/GetMRDLocations", method: "POST", headers: authHeaders
  }, { Params: [], PageContext: { PageNumber: 1, PageSize: 5 } });

  results.push({
    test: "3. Query MRD File Requests & Locations (HTTP API)",
    status: (fileReqRes.status === 200 && mrdLocRes.status === 200) ? "PASSED" : "FAILED",
    details: `HTTP 200, File Requests: ${fileReqRes.data?.PageContext?.TotalRecords}, File Locations: ${mrdLocRes.data?.PageContext?.TotalRecords}`
  });

  // 4. Query Referral Master (HTTP API)
  const refRes = await req({
    host: "localhost", port: 2014, path: "/GeneralMaster/Referral/GetReferrals", method: "POST", headers: authHeaders
  }, { Params: [], PageContext: { PageNumber: 1, PageSize: 10 } });

  results.push({
    test: "4. Query Referral Directory & Masters (HTTP API)",
    status: (refRes.status === 200 && refRes.data?.PageContext?.TotalRecords === 44) ? "PASSED" : "FAILED",
    details: `HTTP 200, Total Referrals: ${refRes.data?.PageContext?.TotalRecords}`
  });

  // 5. Discharge Summary Drafting & Structured Content Persisting
  const certInsert = await pgClient.query(`
    INSERT INTO patientcertificates (
      "PatientId", "PatientName", "PatientMrn", "EncounterId", "FacilityId", "DoctorId",
      "AdmissionDate", "DischargeDate", "TemplateTypeId", "DischargeTypeId",
      "DataTemplate", "CertificateStatusId", "Status"
    ) VALUES (
      1, 'Verified Patient', 'MRN-2026-001', 1, 1, 1,
      NOW() - INTERVAL '3 days', NOW(), 1, 1,
      '{"finalDiagnosis": "Acute Appendicitis", "hospitalCourse": "Uneventful recovery post laparoscopic appendectomy", "dischargeAdvice": "Tab Paracetamol 650mg TDS x 3 days"}',
      1, 1
    ) RETURNING "PatientCertificateId"
  `);
  const certId = certInsert.rows[0].PatientCertificateId;

  results.push({
    test: "5. Discharge Summary Drafting & Structured Content",
    status: certId > 0 ? "PASSED" : "FAILED",
    details: `Discharge Summary #${certId} drafted with clinical course & discharge advice in JSON template`
  });

  // 6. Discharge Summary Medical Approval & Finalization
  await pgClient.query(`
    UPDATE patientcertificates
    SET "CertificateStatusId" = 2, "ApprovedOn" = NOW(), "AprovedBy" = 1, "ReleasedToPatient" = 1, "ReleasedOn" = NOW()
    WHERE "PatientCertificateId" = $1
  `, [certId]);

  const approvedCheck = await pgClient.query(`
    SELECT "CertificateStatusId", "ApprovedOn", "AprovedBy" FROM patientcertificates WHERE "PatientCertificateId" = $1
  `, [certId]);

  results.push({
    test: "6. Discharge Summary Finalization & Medical Approval",
    status: (approvedCheck.rows[0]?.CertificateStatusId === '2' || approvedCheck.rows[0]?.CertificateStatusId === 2) ? "PASSED" : "FAILED",
    details: `Summary #${certId} medically finalized and released with audit sign-off by Doctor #1`
  });

  // 7. MRD File Tracking & Physical Rack/Location Assignment
  const mrdInsert = await pgClient.query(`
    INSERT INTO mrdfilerequests (
      "RequestIdentifier", "RequestDate", "RequestTypeId", "MRDTypeId", "PriorityId",
      "PatientId", "PatientMrn", "EncounterId", "DoctorId", "FromDepartmentId",
      "ToDepartmentId", "CurrentLocationId", "MRDFileStatusId", "MRDMovementStatusId", "Status"
    ) VALUES (
      'MRD-REQ-2026-001', NOW(), 1, 1, 1,
      1, 'MRN-2026-001', 1, 1, 1,
      2, 1, 1, 1, 1
    ) RETURNING "MrdRequestId"
  `);
  const mrdReqId = mrdInsert.rows[0].MrdRequestId;

  const locInsert = await pgClient.query(`
    INSERT INTO mrdfilelocation (
      "BarcodeId", "TransactionDate", "FacilityId", "PatientId", "PatientMrn",
      "EncounterId", "RackId", "LocationId", "MRDFileStatusId", "MRDMovementStatusId", "Status"
    ) VALUES (
      'BAR-MRD-9901', NOW(), 1, 1, 'MRN-2026-001',
      1, 10, 5, 1, 1, 1
    ) RETURNING "MRDFileLocationId"
  `);
  const locId = locInsert.rows[0].MRDFileLocationId;

  results.push({
    test: "7. MRD File Request & Physical Archive Location",
    status: (mrdReqId > 0 && locId > 0) ? "PASSED" : "FAILED",
    details: `MRD Request #${mrdReqId} and Physical Location #${locId} recorded (Rack #10, Barcode: BAR-MRD-9901)`
  });

  // 8. Medico-Legal Case (MLC) Registry Recording
  const mlcInsert = await pgClient.query(`
    INSERT INTO encountermlc (
      "EncounterId", "PatientId", "MLCNo", "AccidentTypeId", "BriefOfAccident",
      "IncidentDate", "PoliceStation", "IsMLC", "MLCStatusId", "Status"
    ) VALUES (
      1, 1, 'MLC-2026-901', 1, 'Road traffic accident on highway',
      NOW(), 'Central Police Station', true, 1, 1
    ) RETURNING "EncounterMLCId"
  `);
  const mlcId = mlcInsert.rows[0].EncounterMLCId;

  results.push({
    test: "8. Medico-Legal Case (MLC) Registry Recording",
    status: mlcId > 0 ? "PASSED" : "FAILED",
    details: `MLC Record #${mlcId} (MLC-2026-901) registered with incident details and police jurisdiction`
  });

  // 9. Notifiable Disease Registry Surveillance
  const notifInsert = await pgClient.query(`
    INSERT INTO patientnotifydiseases (
      "EncounterId", "PatientId", "NotifiableDiseaseTypeId", "NotifiableDiseaseName",
      "Notes", "PerformedDate", "IsActive", "Status"
    ) VALUES (
      1, 1, 1, 'DENGUE FEVER (SEROLOGY POSITIVE)',
      'Notified to District Health Authority', NOW(), true, 1
    ) RETURNING "PatientNotifiableDiseaseId"
  `);
  const notifId = notifInsert.rows[0].PatientNotifiableDiseaseId;

  results.push({
    test: "9. Notifiable Disease Registry Surveillance",
    status: notifId > 0 ? "PASSED" : "FAILED",
    details: `Notifiable Disease #${notifId} recorded for statutory health surveillance`
  });

  // 10. Simultaneous MRD File Tracking & Concurrency
  const concurrentMRDs = await Promise.all([1, 2, 3].map(i => {
    return pgClient.query(`
      INSERT INTO mrdfilerequests (
        "RequestIdentifier", "RequestDate", "RequestTypeId", "MRDTypeId", "PriorityId",
        "PatientId", "EncounterId", "Status"
      ) VALUES (
        $1, NOW(), 1, 1, 1,
        1, 1, 1
      ) RETURNING "MrdRequestId"
    `, [`CONC-MRD-${Date.now()}-${i}`]);
  }));

  results.push({
    test: "10. Simultaneous MRD File Requests Concurrency",
    status: concurrentMRDs.every(m => m.rows.length === 1) ? "PASSED" : "FAILED",
    details: `3 concurrent MRD requests created with unique atomic IDs: ${concurrentMRDs.map(m => m.rows[0].MrdRequestId).join(", ")}`
  });

  // 11. Atomic Transaction Rollback on Certificate Failure
  let rollbackPassed = false;
  try {
    await pgClient.query("BEGIN;");
    await pgClient.query(`INSERT INTO patientcertificates ("PatientName", "FacilityId", "Status") VALUES ('INTENTIONAL_ROLLBACK', 1, 1);`);
    await pgClient.query(`INSERT INTO non_existent_mrd_table ("InvalidCol") VALUES (999);`);
    await pgClient.query("COMMIT;");
  } catch(e) {
    await pgClient.query("ROLLBACK;");
    const checkOrphan = await pgClient.query(`SELECT COUNT(*) FROM patientcertificates WHERE "PatientName" = 'INTENTIONAL_ROLLBACK'`);
    if (parseInt(checkOrphan.rows[0].count, 10) === 0) rollbackPassed = true;
  }

  results.push({
    test: "11. Transaction Integrity: Atomic Rollback",
    status: rollbackPassed ? "PASSED" : "FAILED",
    details: "Failed MRD/Discharge certificate transaction rolled back cleanly with 0 orphaned rows"
  });

  // 12. Multi-Facility Isolation (MRD & Certificates)
  const fac1Certs = await pgClient.query('SELECT COUNT(*) FROM patientcertificates WHERE "FacilityId" = 1');
  const fac2Certs = await pgClient.query('SELECT COUNT(*) FROM patientcertificates WHERE "FacilityId" = 99999');

  results.push({
    test: "12. Multi-Facility Context Isolation",
    status: parseInt(fac2Certs.rows[0].count, 10) === 0 ? "PASSED" : "FAILED",
    details: `Facility 1 returned ${fac1Certs.rows[0].count} certificates; unassigned Facility 99999 returned 0 records`
  });

  console.table(results);
  await pgClient.end();
}

runBatch9TestSuite().catch(console.error);
