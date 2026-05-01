import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientPaymentDetailsService } from '../Service/Index';
import { unlinkSync } from 'fs';
let router: Router = express.Router();

router.post('/AddPatientPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.AddPatientPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddStaffPatientPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.AddStaffPatientPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageReceiptWithAdjustment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.ManageReceiptWithAdjustment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePaymodeChange', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.ManagePaymodeChange(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.UpdatePatientPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/FullBillCancel', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.FullBillCancel(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientPaymentDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.GetPatientPaymentDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.GetPatientPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMinPatientPaymentDetailsforLock', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.GetMinPatientPaymentDetailsforLock(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPharmacySalesCollections', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.GetPharmacySalesCollections(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.DeletePatientPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ModifyPatientPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.ModifyPatientPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/BIReportOverAllCollection', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.BIReportOverAllCollection(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPharmacyCollectionSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.GetPharmacyCollectionSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBillingCollectionSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.GetBillingCollectionSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOverallCollectionSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.GetOverallCollectionSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOPBillingCollectionSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.GetOPBillingCollectionSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOverallCollectionCashier', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.GetOverallCollectionCashier(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUserWiseCollectionCashier', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.GetUserWiseCollectionCashier(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIPBillingCollectionSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.GetIPBillingCollectionSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.PrintPatientPaymentDetails(req.body)
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
router.post('/PrintCollectionReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.PrintCollectionReport(req.body)
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
router.post('/PrintCollectionSummaryOPIP', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.PrintCollectionSummaryOPIP(req.body)
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
router.post('/PrintPharmacyCardCollectionReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.PrintPharmacyCardCollectionReport(req.body)
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
router.post('/PrintPharmacyCollectionSummaryCashier', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.PrintPharmacyCollectionSummaryCashier(req.body)
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
router.post('/PrintOPIPCollectionSummaryCashier', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.PrintOPIPCollectionSummaryCashier(req.body)
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
router.post('/PrintOPCollectionSummaryCashier', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.PrintOPCollectionSummaryCashier(req.body)
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
router.post('/PrintIPCollectionSummaryCashier', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.PrintIPCollectionSummaryCashier(req.body)
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
router.post('/PrintOverallCollectionSummaryCashier', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.PrintOverallCollectionSummaryCashier(req.body)
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
router.post('/PrintUserWiseCollectionSummaryCashier', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.PrintUserWiseCollectionSummaryCashier(req.body)
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
router.post('/PrintPharmacyDueCollectionReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.PrintPharmacyDueCollectionReport(req.body)
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
router.post('/PrintOPDueCollectionReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.PrintOPDueCollectionReport(req.body)
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
router.post('/PrintIPDueCollectionReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.PrintIPDueCollectionReport(req.body)
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
router.post('/PrintIPCollectionReportByCashier', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.PrintIPCollectionReportByCashier(req.body)
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
router.post('/PrintOverallCollectionSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.PrintOverallCollectionSummary(req.body)
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
router.post('/DMPrintPatientPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.DMPrintPatientPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSystemDatetime', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.GetSystemDatetime(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintAdvanceFundDetailsReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.PrintAdvanceFundDetailsReport(req.body)
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
router.post('/PrintIRDSalesReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentDetailsService, req);
    service.PrintIRDSalesReport(req.body)
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
