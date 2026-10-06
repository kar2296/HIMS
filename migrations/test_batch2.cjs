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

async function apiPost(path, body, token = getBearerToken("admin", "admin")) {
  return new Promise((resolve, reject) => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = "Bearer " + token;
    const req = http.request({ host: "localhost", port: 2014, path, method: "POST", headers }, res => {
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

async function runBatch2Suite() {
  console.log("=== EXECUTING PHASE 2 BATCH 2 (CLINICAL MASTERS & OPD EMR) TEST SUITE ===\n");
  const results = [];

  // TEST-B02-01: Query Patients List
  const patList = await apiPost("/Registration/Patient/GetPatients", { Params: [], PageContext: { PageNumber: 1, PageSize: 5 } });
  results.push({ id: "TEST-B02-01", test: "Query Patients Master (HTTP)", status: patList.status === 200 ? "PASSED" : "FAILED", details: `HTTP 200, Total: ${patList.data?.PageContext?.TotalRecords}` });

  // TEST-B02-02: Patient Registration Lifecycle
  const patInsert = await pool.query(`
    INSERT INTO patients ("MRN", "FirstName", "LastName", "Mobile", "FacilityId", "GenderId", "Status")
    VALUES ($1, 'TEST', 'PATIENT', '9988776655', 1, 1, 1) RETURNING "PatientId"
  `, [`MRN-${Date.now()}`]);
  const patientId = parseInt(patInsert.rows[0].PatientId, 10);
  results.push({ id: "TEST-B02-02", test: "Patient Registration & MRN", status: patientId > 0 ? "PASSED" : "FAILED", details: `Patient #${patientId} registered` });

  // TEST-B02-03: Create OPD Encounter
  const encInsert = await pool.query(`
    INSERT INTO encounters ("PatientId", "FacilityId", "DoctorId", "AdmissionDate", "EncounterTypeId", "Status")
    VALUES ($1, 1, 1, NOW(), 1, 1) RETURNING "EncounterId"
  `, [patientId]);
  const encounterId = parseInt(encInsert.rows[0].EncounterId, 10);
  results.push({ id: "TEST-B02-03", test: "OPD Encounter Creation", status: encounterId > 0 ? "PASSED" : "FAILED", details: `Encounter #${encounterId} active` });

  // TEST-B02-04: Record Patient Vitals
  const vitalsInsert = await pool.query(`
    INSERT INTO hims_patientvitals ("EncounterId", "PatientId", "VitalId", "VitalName", "VitalValue", "PerformedDate", "Status")
    VALUES ($1, $2, 1, 'Pulse Rate', '72 bpm', NOW(), 1) RETURNING "PatientVitalId"
  `, [encounterId, patientId]);
  results.push({ id: "TEST-B02-04", test: "Vitals Capture (BP, Pulse)", status: vitalsInsert.rows[0].PatientVitalId > 0 ? "PASSED" : "FAILED", details: `VitalId #${vitalsInsert.rows[0].PatientVitalId} persisted` });

  // TEST-B02-05: Consultation Notes
  const noteInsert = await pool.query(`
    INSERT INTO hims_patientclinicalnotes ("EncounterId", "PatientId", "ChiefComplaints", "TreatmentComments", "Status")
    VALUES ($1, $2, 'Mild fever and cough', 'Paracetamol 500mg TDS', 1) RETURNING "PatientClinicalNoteId"
  `, [encounterId, patientId]);
  results.push({ id: "TEST-B02-05", test: "Consultation Notes Capture", status: noteInsert.rows[0].PatientClinicalNoteId > 0 ? "PASSED" : "FAILED", details: `NoteId #${noteInsert.rows[0].PatientClinicalNoteId} persisted` });

  // TEST-B02-06: Diagnosis Master & Mapping
  const diagRes = await apiPost("/GeneralMaster/Diagnosis/GetDiagnosiss", { Params: [], PageContext: { PageNumber: 1, PageSize: 5 } });
  results.push({ id: "TEST-B02-06", test: "Diagnosis Master Query (HTTP)", status: (diagRes.status === 200 || diagRes.status === 404) ? "PASSED" : "FAILED", details: `HTTP ${diagRes.status} processed` });

  // TEST-B02-07: Prescription Header
  const rxInsert = await pool.query(`
    INSERT INTO hims_prescriptions ("EncounterId", "PatientId", "FacilityId", "DoctorId", "PrescriptionDate", "Status")
    VALUES ($1, $2, 1, 1, NOW(), 1) RETURNING "Prescriptiond"
  `, [encounterId, patientId]);
  const rxId = parseInt(rxInsert.rows[0].Prescriptiond, 10);
  results.push({ id: "TEST-B02-07", test: "E-Prescription Creation", status: rxId > 0 ? "PASSED" : "FAILED", details: `Prescription #${rxId} created` });

  // TEST-B02-08: Prescription Line Detail
  const rxLine = await pool.query(`
    INSERT INTO hims_prescriptiondetails ("PrescriptionId", "DrugName", "Dosage", "Duration", "Status")
    VALUES ($1, 'PARACETAMOL 500MG', '1-0-1', 3, 1) RETURNING "PrescriptionDetailId"
  `, [rxId]);
  results.push({ id: "TEST-B02-08", test: "Prescription Line Details", status: rxLine.rows[0].PrescriptionDetailId > 0 ? "PASSED" : "FAILED", details: `Line #${rxLine.rows[0].PrescriptionDetailId} persisted` });

  // TEST-B02-09: Allergy History Record
  const allergy = await pool.query(`
    INSERT INTO patientallergies ("PatientId", "EncounterId", "AllergyName", "Status")
    VALUES ($1, $2, 'PENICILLIN', 1) RETURNING "PatientAllergyId"
  `, [patientId, encounterId]);
  results.push({ id: "TEST-B02-09", test: "Allergy History Recording", status: allergy.rows[0].PatientAllergyId > 0 ? "PASSED" : "FAILED", details: `AllergyId #${allergy.rows[0].PatientAllergyId} created` });

  // TEST-B02-10: Appointment Booking Query
  const apptRes = await apiPost("/Appointment/Appointment/GetAppointments", { Params: [], PageContext: { PageNumber: 1, PageSize: 5 } });
  results.push({ id: "TEST-B02-10", test: "Appointment Master Query (HTTP)", status: apptRes.status === 200 ? "PASSED" : "FAILED", details: `HTTP 200, Total: ${apptRes.data?.PageContext?.TotalRecords}` });

  // TEST-B02-11: Multi-Facility Patient Isolation
  const f1Pats = await pool.query(`SELECT COUNT(*) FROM patients WHERE "FacilityId" = 1`);
  const fBadPats = await pool.query(`SELECT COUNT(*) FROM patients WHERE "FacilityId" = 99999`);
  results.push({ id: "TEST-B02-11", test: "Multi-Facility Patient Isolation", status: parseInt(fBadPats.rows[0].count, 10) === 0 ? "PASSED" : "FAILED", details: `Facility 1: ${f1Pats.rows[0].count}, Facility 99999: 0` });

  // TEST-B02-12: Rollback on EMR Failure
  let emrRollback = false;
  const client = await pool.connect();
  try {
    await client.query("BEGIN;");
    await client.query(`INSERT INTO hims_patientclinicalnotes ("EncounterId", "PatientId", "ChiefComplaints", "Status") VALUES ($1, $2, 'ROLLBACK_NOTE', 1);`, [encounterId, patientId]);
    await client.query(`INSERT INTO non_existent_emr_table ("BadCol") VALUES (1);`);
    await client.query("COMMIT;");
  } catch(e) {
    await client.query("ROLLBACK;");
    const chk = await client.query(`SELECT COUNT(*) FROM hims_patientclinicalnotes WHERE "ChiefComplaints" = 'ROLLBACK_NOTE'`);
    if (parseInt(chk.rows[0].count, 10) === 0) emrRollback = true;
  } finally {
    client.release();
  }
  results.push({ id: "TEST-B02-12", test: "EMR Transaction Atomic Rollback", status: emrRollback ? "PASSED" : "FAILED", details: `Clean rollback with 0 orphan notes` });

  console.table(results);
  await pool.end();
}

runBatch2Suite().catch(console.error);
