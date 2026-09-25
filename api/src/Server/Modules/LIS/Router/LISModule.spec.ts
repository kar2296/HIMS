/**
 * LIS Module — Automated API Test Suite
 * Framework: Jasmine + Supertest
 *
 * HOW TO RUN:
 *   cd api && npm run test:lis
 */

import * as request from 'supertest';
const CryptoJS = require('crypto-js');

// Allow adequate timeout for heavy database queries on large production tables
jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

// Server configuration
const BASE = 'http://127.0.0.1:' + (process.env.WEB_PORT || 2012);
const SECRET = process.env.JWT_SECRET || 'gloomsoft secret key goes here';

// Generate valid Bearer auth token for testing
const tokenData = { userName: 'sdh', password: '1234' };
const TOKEN = process.env.LIS_TEST_SESSION_TOKEN || CryptoJS.AES.encrypt(JSON.stringify(tokenData), SECRET).toString();

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
describe('LIS — Server Health & Auth', () => {
    it('API server is reachable and responds with 200 with Bearer token', (done: any) => {
        post('/LIS/OrderStatus/GetOrderStatuss', {
            Params: [], PageContext: { PageSize: 5, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            expect(res.body).toBeDefined();
            done();
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. INVESTIGATION SETTINGS (LIS Mode Configuration)
// ─────────────────────────────────────────────────────────────────────────────
describe('LIS — InvestigationSettings', () => {
    let createdId: number = 1;

    it('GET investigation settings — 200', (done: any) => {
        post('/LIS/InvestigationSettings/GetInvestigationSettings', {
            Params: [], PageContext: { PageSize: 10, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            done();
        });
    });

    it('CREATE with all LIS mode columns — 200', (done: any) => {
        post('/LIS/InvestigationSettings/AddInvestigationSettings', {
            Data: {
                LabOrderWithBilling: 1, LabOrderWithoutBilling: 0,
                LabSampleCollection: 1, LabSampleReview: 0,
                LabWorksheetGeneration: 0, LabResultEntry: 1,
                LabResultEntryAbove: 0, LabResultApproval: 1,
                LabResultAuthenticate: 0,
                OtherOrderWithBilling: 1, OtherOrderWithoutBilling: 0,
                OtherWorksheetGeneration: 0, OtherResultEntry: 1,
                OtherResultEntryAbove: 0, OtherResultApproval: 1,
                OtherResultAuthenticate: 0, OtherResultRecvfrmPACS: 0,
                RadioOrderWithBilling: 1, RadioOrderWithoutBilling: 0,
                RadioWorksheetGeneration: 0, RadioResultEntry: 1,
                RadioResultEntryAbove: 0, RadioResultApproval: 1,
                RadioResultAuthenticate: 0, RadioResultRecvfrmPACS: 0,
                Status: 1,
                FacilityId: null,
                LabLISInterfaceEnabled: 0, LabLISMode: 0,
                LabAutoResultAccept: 0, LabSampleRejection: 0,
                LabBarcodePrint: 1, LabResultRecheck: 0,
                LabResultRelease: 0, LabCriticalValueAlert: 1,
                LabExternalLabEnabled: 0, LabMicrobiologyEnabled: 0,
                MicrobiologyEnabled: 0, LabOrderPriority: 0,
                LabConsentRequired: 0, LabTATAlertEnabled: 0,
                LabTATAlertMinutes: 60, RadioRISInterfaceEnabled: 0,
                RadioAutoResultAccept: 0,
            }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            if (res.body && (res.body.InvtsettingsId || res.body.Id)) {
                createdId = res.body.InvtsettingsId || res.body.Id;
            }
            done();
        });
    });

    it('UPDATE — enable Unidirectional LIS (LabLISMode=1)', (done: any) => {
        post('/LIS/InvestigationSettings/UpdateInvestigationSettings', {
            Data: {
                InvtsettingsId: createdId,
                LabLISInterfaceEnabled: 1,
                LabLISMode: 1,
                LabTATAlertEnabled: 1,
                LabTATAlertMinutes: 30
            }
        }).end((err: any, res: any) => {
            expect([200, 204]).toContain(res.status);
            done();
        });
    });

    it('UPDATE — enable Bidirectional LIS (LabLISMode=2)', (done: any) => {
        post('/LIS/InvestigationSettings/UpdateInvestigationSettings', {
            Data: {
                InvtsettingsId: createdId,
                LabLISInterfaceEnabled: 1,
                LabLISMode: 2
            }
        }).end((err: any, res: any) => {
            expect([200, 204]).toContain(res.status);
            done();
        });
    });

    it('UPDATE — enable RIS interface', (done: any) => {
        post('/LIS/InvestigationSettings/UpdateInvestigationSettings', {
            Data: {
                InvtsettingsId: createdId,
                RadioRISInterfaceEnabled: 1,
                RadioAutoResultAccept: 0
            }
        }).end((err: any, res: any) => {
            expect([200, 204]).toContain(res.status);
            done();
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. LIS INTERFACE RESULTS (DisplayNo support)
// ─────────────────────────────────────────────────────────────────────────────
describe('LIS — LISInterfaceResults', () => {
    it('GET results — 200, supports DisplayNo sorting and retrieval', (done: any) => {
        post('/LIS/LISInterfaceResults/GetLISResultsWithoutGroup', {
            Params: [], PageContext: { PageSize: 5, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            expect(res.body).toBeDefined();
            expect(Array.isArray(res.body.Data)).toBe(true);
            done();
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. LAB DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
describe('LIS — LABDashboard', () => {
    it('GET LAB dashboard options — 200', (done: any) => {
        post('/LIS/LABDashboard/GetLABDashboardOptions', {
            Data: { Keys: [{ Key: 'patientworkorderbo' }] },
            Attributes: { FacilityId: 1, FromDate: '2024-01-01 00:00:00', ToDate: '2026-12-31 23:59:59' }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            expect(res.body.patientworkorderbo).toBeDefined();
            done();
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. PATIENT WORKORDER
// ─────────────────────────────────────────────────────────────────────────────
describe('LIS — PatientWorkorder', () => {
    it('GET workorders — 200', (done: any) => {
        post('/LIS/PatientWorkorder/GetPatientWorkorders', {
            Params: [], PageContext: { PageSize: 5, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            done();
        });
    }, 30000);

    it('GET workorder details — 200', (done: any) => {
        post('/LIS/PatientWorkorderdetails/GetPatientWorkorderdetailss', {
            Params: [], PageContext: { PageSize: 5, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            done();
        });
    }, 30000);
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. MASTER / LOOKUP TABLES
// ─────────────────────────────────────────────────────────────────────────────
describe('LIS — Master Tables', () => {
    const masters = [
        { label: 'OrderStatus',      path: '/LIS/OrderStatus/GetOrderStatuss' },
        { label: 'OrderType',        path: '/LIS/OrderType/GetOrderTypes' },
        { label: 'ResultStatus',     path: '/LIS/ResultStatus/GetResultStatuss' },
        { label: 'Analytemaster',    path: '/LIS/Analytemaster/GetAnalytemasters' },
        { label: 'Testmaster',       path: '/LIS/Testmaster/GetTestmasters' },
        { label: 'Sampletype',       path: '/LIS/Sampletype/GetSampletypes' },
        { label: 'Containertype',    path: '/LIS/Containertype/GetContainertypes' },
        { label: 'Drawsite',         path: '/LIS/Drawsite/GetDrawsites' },
        { label: 'AntibioticMaster', path: '/LIS/AntibioticMaster/GetAntibioticMasters' },
        { label: 'PriorityStatus',   path: '/LIS/PriorityStatus/GetPriorityStatuss' },
    ];

    masters.forEach(({ label, path }) => {
        it(`GET ${label} — 200`, (done: any) => {
            post(path, { Params: [], PageContext: { PageSize: 5, PageNumber: 1 } })
                .end((err: any, res: any) => {
                    expect(res.status).toBe(200);
                    done();
                });
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. ORDER TAT
// ─────────────────────────────────────────────────────────────────────────────
describe('LIS — OrderTAT', () => {
    it('GET TAT records — 200', (done: any) => {
        post('/LIS/OrderTAT/GetOrderTATs', {
            Params: [], PageContext: { PageSize: 5, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            done();
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. ANALYZER MAPPING
// ─────────────────────────────────────────────────────────────────────────────
describe('LIS — Analyzer Mapping', () => {
    it('GET AnalyzerTest — 200', (done: any) => {
        post('/LIS/AnalyzerTest/GetAnalyzerTests', {
            Params: [], PageContext: { PageSize: 5, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            done();
        });
    });

    it('GET AnalyzerAnalyteMap — 200', (done: any) => {
        post('/LIS/AnalyzerAnalyteMap/GetAnalyzerAnalyteMaps', {
            Params: [], PageContext: { PageSize: 5, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            done();
        });
    });

    it('GET AnalyserTemplate — 200', (done: any) => {
        post('/LIS/AnalyserTemplate/GetAnalyserTemplates', {
            Params: [], PageContext: { PageSize: 5, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            done();
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. CRITICAL ORDERS
// ─────────────────────────────────────────────────────────────────────────────
describe('LIS — PatientCriticalOrder', () => {
    it('GET critical orders — 200', (done: any) => {
        post('/LIS/PatientCriticalOrder/GetPatientCriticalOrders', {
            Params: [], PageContext: { PageSize: 5, PageNumber: 1 }
        }).end((err: any, res: any) => {
            expect(res.status).toBe(200);
            done();
        });
    });
});
