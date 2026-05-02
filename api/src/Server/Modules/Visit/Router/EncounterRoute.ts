import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { EncounterService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddEncounter', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.AddEncounter(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/SMSWithVisitIdentifier', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.SMSWithVisitIdentifier(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddPharmacyEncounter', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.AddPharmacyEncounter(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateEncounter', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.UpdateEncounter(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/postMedBlaze', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.postMedBlaze(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ExcuteStoredProcedure', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.ExcuteStoredProcedure(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/postWhatsapp', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.postWhatsapp(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/CancelAdmissionEncounter', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.CancelAdmissionEncounter(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageEmergencyBillsTransfer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.ManageEmergencyBillsTransfer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageDayCareAdmissionEncounter', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.ManageDayCareAdmissionEncounter(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageAdmissionEncounter', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.ManageAdmissionEncounter(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEncounterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.GetEncounterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetListofEncounters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.GetListofEncounters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOPDefaultServices', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.GetOPDefaultServices(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEncounters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.GetEncounters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMinEncounters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.GetMinEncounters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIPAdmissionSummaryDoctor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.GetIPAdmissionSummaryDoctor(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDocStatsDashBoard', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.GetDocStatsDashBoard(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIPStatistics', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.GetIPStatistics(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIPStatisticsByWard', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.GetIPStatisticsByWard(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/IPStatisticsWithDate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.IPStatisticsWithDate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOutpatientSummaryDoctor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.GetOutpatientSummaryDoctor(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDiagnosissummaryforIp', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.GetDiagnosissummaryforIp(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIPAdmissionSummaryInsurance', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.GetIPAdmissionSummaryInsurance(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOutpatientSummaryInsurance', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.GetOutpatientSummaryInsurance(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAdditionalVisitwithoutIP', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.GetAdditionalVisitwithoutIP(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/GetEncounterAdvances', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.GetEncounterAdvances(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteEncounter', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.DeleteEncounter(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintEncounter', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintEncounter(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintEncounter5', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintEncounter5(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PatientConsentPrint', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PatientConsentPrint(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/DischargeSlipPrint', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.DischargeSlipPrint(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintAdmissionLabel5', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintAdmissionLabel5(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/AdmitAdmissionRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.AdmitAdmissionRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIPPatientsBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.GetIPPatientsBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMINIPPatientsBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.GetMINIPPatientsBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/BIDepartmentCount', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.BIDepartmentCount(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/BIDoctorCount', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.BIDoctorCount(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/BIDepartmentOPCount', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.BIDepartmentOPCount(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintIPAdmissionReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintIPAdmissionReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintPatientListByDiagnosisReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintPatientListByDiagnosisReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintIPDischargeReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintIPDischargeReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintDeseasedPatientReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintDeseasedPatientReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintIPDueReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintIPDueReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintIPAdmissionSummarybyDoctor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintIPAdmissionSummarybyDoctor(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintIPStatisticsReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintIPStatisticsReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintIPStatisticsByWard', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintIPStatisticsByWard(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintIPDailyWiseStatisticsReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintIPDailyWiseStatisticsReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintIPAdmissionSummarybyInsurance', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintIPAdmissionSummarybyInsurance(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintOutpatientSummarybyInsurance', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintOutpatientSummarybyInsurance(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintOutpatientSummarybyDoctor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintOutpatientSummarybyDoctor(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintDiagnosissummaryforIp', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintDiagnosissummaryforIp(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintOutPatientReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintOutPatientReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintDayCareReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintDayCareReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintMLCReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintMLCReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintEmergencyPatientReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintEmergencyPatientReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintDayCaretoAdmissionPatientReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintDayCaretoAdmissionPatientReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintIPAdmissionInsuranceReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintIPAdmissionInsuranceReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintIPPatientReferralReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintIPPatientReferralReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintOPPatientReferralReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintOPPatientReferralReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintIPBillReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintIPBillReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintCurrentOccupancyReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintCurrentOccupancyReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintOutpatientSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintOutpatientSummary(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintPreviuosSlip', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintPreviuosSlip(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintIPOccupancyAdvanceReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintIPOccupancyAdvanceReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintMLCPatientListReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintMLCPatientListReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintDepartmentWiseStatisticsReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterService, req);
    service.PrintDepartmentWiseStatisticsReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
export default router;
