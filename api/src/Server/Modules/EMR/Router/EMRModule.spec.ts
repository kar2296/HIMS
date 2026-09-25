/**
 * EMR Module — Comprehensive Automated API Test Suite
 * Framework: Jasmine + Supertest
 *
 * Verifies EMR Clinical Modules, Print Generation Engines, and Data Workflows:
 * - Server Health & AES Token Authorization
 * - Prescriptions & Medication Management
 * - Print PDF Generation (Prescriptions, Medications, Consultations)
 * - Patient Vitals & Clinical Monitoring
 * - Consultations & Clinical Documentation
 * - Clinical Orders (CPOE) & Order Details
 * - Patient Allergies & Adverse Reactions
 * - Patient Conditions & Diagnoses (ICD-10)
 * - Daily Nursing Notes & Inpatient Care
 * - Clinical Documents & Attachments
 *
 * HOW TO RUN:
 *   cd api && npm run test:emr
 */

import * as request from 'supertest';
const CryptoJS = require('crypto-js');

// Set adequate timeout for PhantomJS PDF rendering and heavy database tables
const SPEC_TIMEOUT = 60000;
if (typeof (jasmine as any).getEnv === 'function') {
    (jasmine as any).getEnv().defaultTimeoutInterval = SPEC_TIMEOUT;
}
(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = SPEC_TIMEOUT;

// Server configuration
const BASE = 'http://127.0.0.1:' + (process.env.WEB_PORT || 2012);
const SECRET = process.env.JWT_SECRET || 'gloomsoft secret key goes here';

// Generate valid Bearer auth token for testing
const tokenData = { userName: 'sdh', password: '1234' };
const TOKEN = process.env.EMR_TEST_SESSION_TOKEN || CryptoJS.AES.encrypt(JSON.stringify(tokenData), SECRET).toString();

function post(path: string, body: any) {
    return request(BASE)
        .post(path)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + TOKEN)
        .send(body);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SERVER HEALTH & AUTHENTICATION
// ─────────────────────────────────────────────────────────────────────────────
describe('EMR — Server Health & Auth', () => {
    it('API server responds with 200 with Bearer token', (done: any) => {
        post('/EMR/Prescription/GetPrescriptions', {
            Params: [{ Key: 12, Value: 3810 }], PageContext: { PageSize: 5, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            expect(res.body).toBeDefined();
            done();
        });
    }, SPEC_TIMEOUT);

    it('API server rejects unauthenticated request without valid token', (done: any) => {
        request(BASE)
            .post('/EMR/Prescription/GetPrescriptions')
            .send({ Params: [], PageContext: { PageSize: 5, PageNumber: 1 } })
            .end((err: any, res: any) => {
                expect(res.status).not.toBe(200);
                done();
            });
    }, SPEC_TIMEOUT);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. PRESCRIPTIONS & MEDICATION MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
describe('EMR — Prescriptions Module', () => {
    const samplePrescriptionId = 11768;

    it('GET Prescriptions list — 200 with pagination', (done: any) => {
        post('/EMR/Prescription/GetPrescriptions', {
            Params: [{ Key: 12, Value: 3810 }], PageContext: { PageSize: 10, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            expect(res.body.Data).toBeDefined();
            expect(Array.isArray(res.body.Data)).toBe(true);
            done();
        });
    }, SPEC_TIMEOUT);

    it('GET Prescriptions Without Details — 200', (done: any) => {
        post('/EMR/Prescription/GetPrescriptionsWithoutDetails', {
            Params: [{ Key: 12, Value: 3810 }], PageContext: { PageSize: 5, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            expect(res.body.Data).toBeDefined();
            done();
        });
    }, SPEC_TIMEOUT);

    it('GET Prescription By Id — 200', (done: any) => {
        post('/EMR/Prescription/GetPrescriptionById', {
            Id: samplePrescriptionId
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            expect(res.body).toBeDefined();
            done();
        });
    }, SPEC_TIMEOUT);

    it('GET Prescription Details — 200', (done: any) => {
        post('/EMR/PrescriptionDetail/GetPrescriptionDetails', {
            Params: [], PageContext: { PageSize: 10, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            expect(res.body.Data).toBeDefined();
            expect(Array.isArray(res.body.Data)).toBe(true);
            done();
        });
    }, SPEC_TIMEOUT);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. PRINT GENERATION ENGINE (PDF & CLINICAL EXPORTS)
// ─────────────────────────────────────────────────────────────────────────────
describe('EMR — Print Generation Engine', () => {
    it('Print Prescription returns valid PDF binary stream (HTTP 200, application/pdf)', (done: any) => {
        request(BASE)
            .post('/EMR/Prescription/PrintPrescription')
            .set('Authorization', 'Bearer ' + TOKEN)
            .send({ Id: 11768 })
            .end((err: any, res: any) => {
                expect(res.status).toBe(200);
                expect(res.headers['content-type']).toContain('application/pdf');
                expect(res.body).toBeDefined();
                done();
            });
    }, SPEC_TIMEOUT);

    it('Print Active Medication returns valid binary stream (HTTP 200, application/pdf)', (done: any) => {
        request(BASE)
            .post('/EMR/Prescription/PrintActiveMedication')
            .set('Authorization', 'Bearer ' + TOKEN)
            .send({ Id: 3810 })
            .end((err: any, res: any) => {
                expect(res.status).toBe(200);
                expect(res.headers['content-type']).toContain('application/pdf');
                done();
            });
    }, SPEC_TIMEOUT);

    it('Print Consultation returns valid clinical PDF (HTTP 200, application/pdf)', (done: any) => {
        request(BASE)
            .post('/EMR/Consultation/PrintConsultation')
            .set('Authorization', 'Bearer ' + TOKEN)
            .send({ Id: 1, Data: { PatientId: 135, ConsultationId: 1, sectionList: [] } })
            .end((err: any, res: any) => {
                expect(res.status).toBe(200);
                expect(res.headers['content-type']).toContain('application/pdf');
                done();
            });
    }, SPEC_TIMEOUT);
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. PATIENT VITALS & CLINICAL MONITORING
// ─────────────────────────────────────────────────────────────────────────────
describe('EMR — Patient Vitals Module', () => {
    let sampleVitalId: number = 1;

    it('GET Patient Vitals list — 200', (done: any) => {
        post('/EMR/PatientVital/GetPatientVitals', {
            Params: [], PageContext: { PageSize: 10, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            expect(res.body.Data).toBeDefined();
            expect(Array.isArray(res.body.Data)).toBe(true);
            if (res.body.Data.length > 0 && res.body.Data[0].PatientVitalId) {
                sampleVitalId = res.body.Data[0].PatientVitalId;
            }
            done();
        });
    }, SPEC_TIMEOUT);

    it('GET Patient Vital By Id — 200', (done: any) => {
        post('/EMR/PatientVital/GetPatientVitalById', {
            Id: sampleVitalId
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            expect(res.body).toBeDefined();
            done();
        });
    }, SPEC_TIMEOUT);
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. CONSULTATIONS & CLINICAL PROGRESS NOTES
// ─────────────────────────────────────────────────────────────────────────────
describe('EMR — Consultations & Clinical Notes', () => {
    let sampleConsultationId: number = 1;

    it('GET Consultations list — 200', (done: any) => {
        post('/EMR/Consultation/GetConsultations', {
            Params: [], PageContext: { PageSize: 10, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            expect(res.body.Data).toBeDefined();
            expect(Array.isArray(res.body.Data)).toBe(true);
            if (res.body.Data.length > 0 && res.body.Data[0].ConsultationId) {
                sampleConsultationId = res.body.Data[0].ConsultationId;
            }
            done();
        });
    }, SPEC_TIMEOUT);

    it('GET Consultation By Id — 200', (done: any) => {
        post('/EMR/Consultation/GetConsultationById', {
            Id: sampleConsultationId
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            expect(res.body).toBeDefined();
            done();
        });
    }, SPEC_TIMEOUT);

    it('GET Patient Clinical Notes list — 200', (done: any) => {
        post('/EMR/PatientClinicalNotes/GetPatientClinicalNotess', {
            Params: [], PageContext: { PageSize: 10, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            expect(res.body.Data).toBeDefined();
            expect(Array.isArray(res.body.Data)).toBe(true);
            done();
        });
    }, SPEC_TIMEOUT);
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. CLINICAL ORDERS (CPOE) & ORDER DETAILS
// ─────────────────────────────────────────────────────────────────────────────
describe('EMR — Clinical Orders (CPOE)', () => {
    it('GET Patient Orders list — 200', (done: any) => {
        post('/EMR/PatientOrder/GetPatientOrders', {
            Params: [], PageContext: { PageSize: 10, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            expect(res.body.Data).toBeDefined();
            expect(Array.isArray(res.body.Data)).toBe(true);
            done();
        });
    }, SPEC_TIMEOUT);

    it('GET Patient Orders Without Details — 200', (done: any) => {
        post('/EMR/PatientOrder/GetPatientOrderWithoutDetails', {
            Params: [], PageContext: { PageSize: 5, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            expect(res.body.Data).toBeDefined();
            done();
        });
    }, SPEC_TIMEOUT);

    it('GET Minimum Patient Orders — 200', (done: any) => {
        post('/EMR/PatientOrder/GetMinPatientOrders', {
            Params: [], PageContext: { PageSize: 5, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            expect(res.body.Data).toBeDefined();
            done();
        });
    }, SPEC_TIMEOUT);

    it('GET Patient Order Details list — 200', (done: any) => {
        post('/EMR/PatientOrderDetail/GetPatientOrderDetails', {
            Params: [], PageContext: { PageSize: 10, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            expect(res.body.Data).toBeDefined();
            expect(Array.isArray(res.body.Data)).toBe(true);
            done();
        });
    }, SPEC_TIMEOUT);
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. ALLERGIES & CLINICAL CONDITIONS
// ─────────────────────────────────────────────────────────────────────────────
describe('EMR — Allergies & Conditions', () => {
    it('GET Patient Allergies list — 200', (done: any) => {
        post('/EMR/PatientAllergy/GetPatientAllergys', {
            Params: [], PageContext: { PageSize: 10, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            expect(res.body.Data).toBeDefined();
            expect(Array.isArray(res.body.Data)).toBe(true);
            done();
        });
    }, SPEC_TIMEOUT);

    it('GET Patient Conditions list — 200', (done: any) => {
        post('/EMR/PatientCondition/GetPatientConditions', {
            Params: [], PageContext: { PageSize: 10, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            expect(res.body.Data).toBeDefined();
            expect(Array.isArray(res.body.Data)).toBe(true);
            done();
        });
    }, SPEC_TIMEOUT);
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. PATIENT DIAGNOSES (ICD-10)
// ─────────────────────────────────────────────────────────────────────────────
describe('EMR — Diagnoses Module', () => {
    it('GET Patient Diagnoses list — 200', (done: any) => {
        post('/EMR/PatientDiagnosis/GetPatientDiagnosiss', {
            Params: [], PageContext: { PageSize: 10, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            expect(res.body.Data).toBeDefined();
            expect(Array.isArray(res.body.Data)).toBe(true);
            done();
        });
    }, SPEC_TIMEOUT);
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. DAILY NURSING & INPATIENT PROGRESS NOTES
// ─────────────────────────────────────────────────────────────────────────────
describe('EMR — Daily Notes Module', () => {
    it('GET Daily Notes list — 200', (done: any) => {
        post('/EMR/DailyNote/GetDailyNotes', {
            Params: [], PageContext: { PageSize: 10, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            expect(res.body.Data).toBeDefined();
            expect(Array.isArray(res.body.Data)).toBe(true);
            done();
        });
    }, SPEC_TIMEOUT);
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. CLINICAL DOCUMENTS & ATTACHMENTS
// ─────────────────────────────────────────────────────────────────────────────
describe('EMR — Clinical Documents Module', () => {
    it('GET Clinical Documents archive — 200', (done: any) => {
        post('/EMR/ClinicalDocument/GetClinicalDocuments', {
            Params: [], PageContext: { PageSize: 10, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            expect(res.body.Data).toBeDefined();
            expect(Array.isArray(res.body.Data)).toBe(true);
            done();
        });
    }, SPEC_TIMEOUT);
});
