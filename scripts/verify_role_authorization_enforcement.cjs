// scripts/verify_role_authorization_enforcement.cjs
const http = require('http');
const CryptoJS = require('/Users/sharmila/Rajesh/my-app/node_modules/crypto-js');
const dotenv = require('/Users/sharmila/Rajesh/my-app/node_modules/dotenv');
const { Client: PGClient } = require('/Users/sharmila/Rajesh/my-app/node_modules/pg');

dotenv.config({ path: '/Users/sharmila/Rajesh/hims-release-clean/api/.env' });

const API_PORT = 2018;
const API_HOST = 'localhost';
const AES_KEY = process.env.AES_PASSWORD_KEY || '3ad77bb40d7a3660a89ecaf32466ef97';
const JWT_SECRET = process.env.JWT_SECRET || 'gloomsoft secret key goes here';

const PG_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'sharmila',
  database: 'hims_clean_prov_db'
};

const PASSWORDS = {
  uat_registration: 'UatReg@2026!',
  uat_cashier: 'UatCashier@2026!',
  uat_doctor: 'UatDoctor@2026!',
  uat_nurse: 'UatNurse@2026!',
  uat_lab: 'UatLab@2026!',
  uat_pharmacy: 'UatPharm@2026!',
  uat_ot: 'UatOt@2026!',
  uat_insurance: 'UatIns@2026!',
  uat_mrd: 'UatMrd@2026!',
  uat_admin: 'UatAdmin@2026!'
};

function createBearerToken(userName, password) {
  const payload = JSON.stringify({ userName, password });
  return CryptoJS.AES.encrypt(payload, JWT_SECRET).toString();
}

async function loginSession(username) {
  const password = PASSWORDS[username];
  const token = createBearerToken(username, password);
  return { token };
}

function makeApiCall({ method, path, body, token }) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const headers = {};
    if (postData) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(postData);
    }
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: API_HOST,
      port: API_PORT,
      path,
      method,
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
        resolve({ statusCode: res.statusCode, headers: res.headers, data: parsed });
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runRoleAudit() {
  const pg = new PGClient(PG_CONFIG);
  await pg.connect();

  console.log('================================================================');
  console.log('🛡️ AUTHORIZATION & ROLE-DENIAL VERIFICATION AUDIT');
  console.log(`Target API: http://${API_HOST}:${API_PORT}`);
  console.log(`Target Database: ${PG_CONFIG.database}`);
  console.log(`Execution Time: ${new Date().toISOString()}`);
  console.log('================================================================\n');

  const auditResults = [];

  try {
    // -------------------------------------------------------------
    // Audit Check 1: Clinical Notes Authorization & Immutability
    // Route: POST /EMR/PatientClinicalNotes/UpdatePatientClinicalNotes
    // Authorized: uat_doctor
    // Unauthorized: uat_cashier
    // -------------------------------------------------------------
    console.log('--- [Audit 1] EMR Clinical Note Authorization ---');
    const doc = await loginSession('uat_doctor');
    const docRes = await makeApiCall({
      method: 'POST',
      path: '/EMR/PatientClinicalNotes/AddPatientClinicalNotes',
      token: doc.token,
      body: {
        Data: {
          PatientId: 1,
          ConsultationId: 1,
          ChiefComplaints: 'Authorized Doctor Note - General Consultation',
          TreatmentComments: 'Initial doctor notes draft',
          FacilityId: 1,
          NoteStatus: 1
        }
      }
    });

    const docOk = docRes.statusCode === 200;
    const emrNoteId = (docRes.data && docRes.data.Data) || docRes.data;
    console.log(`Authorized Doctor Execution: HTTP ${docRes.statusCode} -> Note ID ${emrNoteId} (Success: ${docOk})`);

    // 1.2 Sign the Note as Doctor
    const docSignRes = await makeApiCall({
      method: 'POST',
      path: '/EMR/PatientClinicalNotes/SignPatientClinicalNote',
      token: doc.token,
      body: { Id: emrNoteId, Data: { Id: emrNoteId, FacilityId: 1 } }
    });
    console.log(`Doctor Sign Note Execution: HTTP ${docSignRes.statusCode} -> Result: ${JSON.stringify(docSignRes.data)}`);

    // 1.3 Unauthorized Cashier attempting to update unsigned/signed doctor note -> MUST return 403
    const cashier = await loginSession('uat_cashier');
    const cashierRes = await makeApiCall({
      method: 'POST',
      path: '/EMR/PatientClinicalNotes/UpdatePatientClinicalNotes',
      token: cashier.token,
      body: {
        Data: {
          Id: emrNoteId,
          ChiefComplaints: 'Tampered Cashier Note - Unauthorized Modification',
          TreatmentComments: 'Unauthorized edit by cashier',
          FacilityId: 1
        }
      }
    });

    const noteAfter = (await pg.query('SELECT "ChiefComplaints", "TreatmentComments", "NoteStatus" FROM hims_patientclinicalnotes WHERE "PatientClinicalNoteId" = $1', [emrNoteId])).rows[0];
    const cashierBlocked = cashierRes.statusCode === 403;
    const noCashierTampering = noteAfter.ChiefComplaints === 'Authorized Doctor Note - General Consultation';

    auditResults.push({
      testCase: 'S1.16 - Cashier EMR Modification Denial',
      route: 'POST /EMR/PatientClinicalNotes/UpdatePatientClinicalNotes',
      authorizedRole: 'uat_doctor (HTTP 200 Success)',
      unauthorizedRole: 'uat_cashier',
      deniedStatus: `HTTP ${cashierRes.statusCode}`,
      deniedResponse: cashierRes.data?.Error?.Message || JSON.stringify(cashierRes.data),
      noDatabaseMutation: noCashierTampering,
      verdict: docOk && cashierBlocked && noCashierTampering ? 'PASS' : 'FAIL'
    });

    console.log(`Unauthorized Cashier Status: HTTP ${cashierRes.statusCode}`);
    console.log(`Response Error: ${cashierRes.data?.Error?.Message || JSON.stringify(cashierRes.data)}`);
    console.log(`Database Mutated: ${!noCashierTampering ? 'YES (TAMPERED)' : 'NO (ZERO MUTATION)'}`);
    console.log(`Verdict: ${auditResults[0].verdict}\n`);

    // -------------------------------------------------------------
    // Audit Check 2: Financial Refund Approval
    // Route: POST /Billing/PatientRefund/AddPatientRefund
    // Authorized: uat_admin / uat_cashier
    // Unauthorized: uat_nurse
    // -------------------------------------------------------------
    console.log('--- [Audit 2] Financial Refund Authorization ---');
    const refundCountBefore = Number((await pg.query('SELECT COUNT(*) FROM patientrefund')).rows[0].count);

    // 2.1 Authorized Admin
    const admin = await loginSession('uat_admin');
    const adminRefundRes = await makeApiCall({
      method: 'POST',
      path: '/Billing/PatientRefund/AddPatientRefund',
      token: admin.token,
      body: {
        Data: {
          Header: {
            PatientBillId: 1,
            PatientId: 1,
            RefundAmount: 25.00,
            RefundStatusId: 2,
            FacilityId: 1,
            RefundReason: 'Authorized Supervisor Refund Approval Verification'
          }
        }
      }
    });

    const adminOk = adminRefundRes.statusCode === 200;
    console.log(`Authorized Admin Execution: HTTP ${adminRefundRes.statusCode} -> Result: ${JSON.stringify(adminRefundRes.data)} (Success: ${adminOk})`);

    // 2.2 Unauthorized Nurse attempting refund
    const nurse = await loginSession('uat_nurse');
    const nurseRefundRes = await makeApiCall({
      method: 'POST',
      path: '/Billing/PatientRefund/AddPatientRefund',
      token: nurse.token,
      body: {
        Data: {
          Header: {
            PatientBillId: 1,
            PatientId: 1,
            RefundAmount: 999.00,
            RefundStatusId: 1,
            FacilityId: 1,
            RefundReason: 'Unauthorized Nurse Refund'
          }
        }
      }
    });

    const unauthorizedRefundInDb = (await pg.query('SELECT COUNT(*) FROM patientrefund WHERE "Comments" = $1', ['Unauthorized Nurse Refund'])).rows[0].count;
    const nurseBlocked = nurseRefundRes.statusCode === 403;
    const noNurseRefundMutation = Number(unauthorizedRefundInDb) === 0;

    auditResults.push({
      testCase: 'S1.17 - Nurse Refund Approval Denial',
      route: 'POST /Billing/PatientRefund/AddPatientRefund',
      authorizedRole: 'uat_admin (HTTP 200 Success)',
      unauthorizedRole: 'uat_nurse',
      deniedStatus: `HTTP ${nurseRefundRes.statusCode}`,
      deniedResponse: nurseRefundRes.data?.Error?.Message || JSON.stringify(nurseRefundRes.data),
      noDatabaseMutation: noNurseRefundMutation,
      verdict: adminOk && nurseBlocked && noNurseRefundMutation ? 'PASS' : 'FAIL'
    });

    console.log(`Unauthorized Nurse Status: HTTP ${nurseRefundRes.statusCode}`);
    console.log(`Response Error: ${nurseRefundRes.data?.Error?.Message || JSON.stringify(nurseRefundRes.data)}`);
    console.log(`Database Mutated: ${!noNurseRefundMutation ? 'YES (UNAUTHORIZED WRITE)' : 'NO (ZERO MUTATION)'}`);
    console.log(`Verdict: ${auditResults[1].verdict}\n`);

    // -------------------------------------------------------------
    // Audit Check 3: OT Surgery Schedule Creation
    // Route: POST /OtManagement/OtSchedule/AddOtSchedule
    // Authorized: uat_ot
    // Unauthorized: uat_lab
    // -------------------------------------------------------------
    console.log('--- [Audit 3] OT Surgery Schedule Authorization ---');
    const otScheduleCountBefore = Number((await pg.query('SELECT COUNT(*) FROM hims_surgeryschedule')).rows[0].count);

    // 3.1 Authorized OT User
    const ot = await loginSession('uat_ot');
    const otRes = await makeApiCall({
      method: 'POST',
      path: '/OtManagement/OtSchedule/AddOtSchedule',
      token: ot.token,
      body: {
        Data: {
          PatientId: 1,
          DoctorId: 1,
          OTRoomId: 1,
          FacilityId: 1,
          OTScheduledOn: new Date(),
          Remarks: 'Authorized OT Team Schedule Verification'
        }
      }
    });

    const otOk = otRes.statusCode === 200;
    console.log(`Authorized OT User Execution: HTTP ${otRes.statusCode} -> Result: ${JSON.stringify(otRes.data)} (Success: ${otOk})`);

    // 3.2 Unauthorized Lab Tech attempting OT scheduling
    const lab = await loginSession('uat_lab');
    const labRes = await makeApiCall({
      method: 'POST',
      path: '/OtManagement/OtSchedule/AddOtSchedule',
      token: lab.token,
      body: {
        Data: {
          PatientId: 1,
          DoctorId: 1,
          OTRoomId: 1,
          FacilityId: 1,
          OTScheduledOn: new Date(),
          Remarks: 'Unauthorized Lab Tech Schedule'
        }
      }
    });

    const unauthorizedOtInDb = (await pg.query('SELECT COUNT(*) FROM hims_surgeryschedule WHERE "Remarks" = $1', ['Unauthorized Lab Tech Schedule'])).rows[0].count;
    const labBlocked = labRes.statusCode === 403;
    const noLabOtMutation = Number(unauthorizedOtInDb) === 0;

    auditResults.push({
      testCase: 'S1.18 - Lab Tech OT Schedule Denial',
      route: 'POST /OtManagement/OtSchedule/AddOtSchedule',
      authorizedRole: 'uat_ot (HTTP 200 Success)',
      unauthorizedRole: 'uat_lab',
      deniedStatus: `HTTP ${labRes.statusCode}`,
      deniedResponse: labRes.data?.Error?.Message || JSON.stringify(labRes.data),
      noDatabaseMutation: noLabOtMutation,
      verdict: otOk && labBlocked && noLabOtMutation ? 'PASS' : 'FAIL'
    });

    console.log(`Unauthorized Lab Status: HTTP ${labRes.statusCode}`);
    console.log(`Response Error: ${labRes.data?.Error?.Message || JSON.stringify(labRes.data)}`);
    console.log(`Database Mutated: ${!noLabOtMutation ? 'YES (UNAUTHORIZED WRITE)' : 'NO (ZERO MUTATION)'}`);
    console.log(`Verdict: ${auditResults[2].verdict}\n`);

    // Clean test artifacts
    await pg.query('DELETE FROM hims_patientclinicalnotes WHERE "ChiefComplaints" LIKE $1', ['%Authorized Doctor Note%']);
    await pg.query('DELETE FROM patientrefund WHERE "Comments" LIKE $1 OR "Comments" LIKE $2', ['%Supervisor Refund%', '%Unauthorized Nurse Refund%']);
    await pg.query('DELETE FROM hims_surgeryschedule WHERE "Remarks" LIKE $1 OR "Remarks" LIKE $2', ['%Authorized OT Team Schedule%', '%Unauthorized Lab Tech Schedule%']);

    console.log('================================================================');
    console.log('📊 AUDIT SUMMARY TABLE');
    console.log('================================================================');
    console.table(auditResults);

    const allPassed = auditResults.every(r => r.verdict === 'PASS');
    console.log(`\nFinal RBAC Enforcement Result: ${allPassed ? '✅ ALL CHECKS PASSED' : '❌ FAILURES DETECTED'}`);
    process.exit(allPassed ? 0 : 1);

  } catch (err) {
    console.error('Fatal audit error:', err);
    process.exit(1);
  } finally {
    await pg.end();
  }
}

runRoleAudit();
