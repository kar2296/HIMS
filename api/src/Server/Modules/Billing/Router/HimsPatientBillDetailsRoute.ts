import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientBillDetailsService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.AddPatientBillDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.UpdatePatientBillDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBillDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.GetPatientBillDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientInsuranceBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.GetPatientInsuranceBillDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/GetPatientBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.GetPatientBillDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMinPatientBillDetailsforLock', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.GetMinPatientBillDetailsforLock(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBillDetailsforprint', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.GetPatientBillDetailsforprint(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/GetPharmacyBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.GetPharmacyBillDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBillDetailsforStockserialItem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.GetPatientBillDetailsforStockserialItem(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/GetPatientBillDetailsForPerformingDoctors', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.GetPatientBillDetailsForPerformingDoctors(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientPharmacyBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.GetPatientPharmacyBillDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientOTPharmacyBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.GetPatientOTPharmacyBillDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.DeletePatientBillDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/SaleGSTDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.SaleGSTDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDailySalesSummarybyItem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.GetDailySalesSummarybyItem(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetConsolidateSaleGst', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.GetConsolidateSaleGst(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOverallConsolidateGst', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.GetOverallConsolidateGst(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetConsolidateOutputGst', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.GetConsolidateOutputGst(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRevenueServiceItemSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.GetRevenueServiceItemSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPreviousOrders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.GetPreviousOrders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateInsuranceBillModifed', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.UpdateInsuranceBillModifed(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateInsuranceBill', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.UpdateInsuranceBill(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDoctorShareDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.UpdateDoctorShareDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateBillRates', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.UpdateBillRates(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientBillComments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.ManagePatientBillComments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientCancelItemwise', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.UpdatePatientCancelItemwise(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ExcelPatientBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.ExcelPatientBillDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.PrintPatientBillDetails(req.body)
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
router.post('/PrintLabsummaryReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.PrintLabsummaryReport(req.body)
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
router.post('/PrintRadiologyRevenueReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.PrintRadiologyRevenueReport(req.body)
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
router.post('/PrintLabRevenueReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.PrintLabRevenueReport(req.body)
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
router.post('/PrintRevenueSummaryCategoryReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.PrintRevenueSummaryCategoryReport(req.body)
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
router.post('/PrintPharmacyScheduleReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.PrintPharmacyScheduleReport(req.body)
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
router.post('/PrintPharmacyScheduleXReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.PrintPharmacyScheduleXReport(req.body)
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
router.post('/PrintItemwisesalesprofit', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.PrintItemwisesalesprofit(req.body)
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
router.post('/PrintDoctorRevenueReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.PrintDoctorRevenueReport(req.body)
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
router.post('/PrintRevenueSummaryByServiceItem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.PrintRevenueSummaryByServiceItem(req.body)
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
router.post('/PrintItemCollectionSummaryReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.PrintItemCollectionSummaryReport(req.body)
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
router.post('/PrintItemCollectionSummaryOPReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.PrintItemCollectionSummaryOPReport(req.body)
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
router.post('/PrintDailySalesandRevenueDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.PrintDailySalesandRevenueDetails(req.body)
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
router.post('/PrintSaleGSTReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.PrintSaleGSTReport(req.body)
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
router.post('/PrintConsolidateSaleGSTReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.PrintConsolidateSaleGSTReport(req.body)
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
router.post('/PrintConsolidateOuputGSTSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.PrintConsolidateOuputGSTSummary(req.body)
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
router.post('/PrintDailySalesSummaryReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.PrintDailySalesSummaryReport(req.body)
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
router.post('/PrintOverallConsolidateGSTSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.PrintOverallConsolidateGSTSummary(req.body)
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
router.post('/UpdateSimpleViewBill', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.UpdateSimpleViewBill(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/BICategoryRevneue', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillDetailsService, req);
    service.BICategoryRevneue(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
