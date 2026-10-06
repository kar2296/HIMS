import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientBillsService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.AddPatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddIPPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.AddIPPatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddBedChargePatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.AddBedChargePatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientBillsFromCancel', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.UpdatePatientBillsFromCancel(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientBillsCancel', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.UpdatePatientBillsCancel(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientBillsInsurance', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.UpdatePatientBillsInsurance(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientBillsforDiscount', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.UpdatePatientBillsforDiscount(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientBillsforDue', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.UpdatePatientBillsforDue(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientBillsFromBedOccupancy', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.UpdatePatientBillsFromBedOccupancy(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateBillDiscount', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.UpdateBillDiscount(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.UpdatePatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientBillsFromPlans', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.UpdatePatientBillsFromPlans(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddPatientStaffBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.AddPatientStaffBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientStaffBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.UpdatePatientStaffBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateVirtualPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.UpdateVirtualPatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddPatientB2BBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.AddPatientB2BBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/BIDeptRevneue', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.BIDeptRevneue(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/BIDoctorRevneue', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.BIDoctorRevneue(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/checkBillCashAmount', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.checkBillCashAmount(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRevenueDoctorSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetRevenueDoctorSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBillsforInsuranceupdate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetPatientBillsforInsuranceupdate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRevenueDepartmentSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetRevenueDepartmentSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPharmacyDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetPharmacyDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientTaxableBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetPatientTaxableBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/BIDiscountReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.BIDiscountReport(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBillswithoutdetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetPatientBillswithoutdetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRevenueDetals', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetRevenueDetals(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/BIDueReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.BIDueReport(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddPatientPharmacyBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.AddPatientPharmacyBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddIPPatientPharmacyBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.AddIPPatientPharmacyBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddConsignmentBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.AddConsignmentBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientPharmacyBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.UpdatePatientPharmacyBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddPatientOpticalBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.AddPatientOpticalBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientOpticalBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.UpdatePatientOpticalBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageCashToCreditBill', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.ManageCashToCreditBill(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageIPCashToOPCreditBill', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.ManageIPCashToOPCreditBill(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFindPharmacyBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetFindPharmacyBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFindDirectPharmacyBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetFindDirectPharmacyBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientPharmacyBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetPatientPharmacyBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFindPatientPharmacyBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetFindPatientPharmacyBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/getInpatientBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.getInpatientBillDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintAllPharmacybilldetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintAllPharmacybilldetails(req.body)
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
router.post('/PrintStaffBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintStaffBills(req.body)
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
router.post('/GetPatientBillsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetPatientBillsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBillsByEncounterId', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetPatientBillsByEncounterId(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetPatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBillsemrbillingservice', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetPatientBillsemrbillingservice(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBillsforprint', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetPatientBillsforprint(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPharmacyPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetPharmacyPatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/checkBillFinalized', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.checkBillFinalized(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetClinicalPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetClinicalPatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIPBillPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetIPBillPatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFindPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetFindPatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.DeletePatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/getPharmacyBillsWithReturn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.getPharmacyBillsWithReturn(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/getPharmacyClearanceBillsWithReturn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.getPharmacyClearanceBillsWithReturn(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetInsuranceCreditSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetInsuranceCreditSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetInsuranceOutstandingSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetInsuranceOutstandingSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStaffCreditSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetStaffCreditSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/WhatsAppDocumentSent', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.WhatsAppDocumentSent(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintOPPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintOPPatientBills(req.body)
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
router.post('/ModPrintPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.ModPrintPatientBills(req.body)
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
router.post('/PrintPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintPatientBills(req.body)
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
router.post('/PrintPatientBills1', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintPatientBills1(req.body)
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
router.post('/ThermalPrintPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.ThermalPrintPatientBills(req.body)
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
router.post('/PrintDailyBillReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintDailyBillReport(req.body)
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
router.post('/PrintOpticalDailybillReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintOpticalDailybillReport(req.body)
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
router.post('/PrintInsuranceCreditSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintInsuranceCreditSummary(req.body)
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
router.post('/PrintInsuranceOutstandingSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintInsuranceOutstandingSummary(req.body)
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
router.post('/PrintStaffCreditSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintStaffCreditSummary(req.body)
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
router.post('/PrintDiscountReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintDiscountReport(req.body)
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
router.post('/PrintIPDiscountReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintIPDiscountReport(req.body)
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
router.post('/PrintRevenueSummaryDoctorReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintRevenueSummaryDoctorReport(req.body)
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
router.post('/PrintRevenueSummaryDepartmentReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintRevenueSummaryDepartmentReport(req.body)
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
router.post('/PrintOutstandingReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintOutstandingReport(req.body)
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
    const service = ServiceFactory.CreateService(PatientBillsService, req);
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
router.post('/PrintCancelReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintCancelReport(req.body)
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
router.post('/PrintPharmacyBillDetailReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintPharmacyBillDetailReport(req.body)
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
router.post('/PrintStaffCreditBillReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintStaffCreditBillReport(req.body)
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
router.post('/PrintStaffPendingPaymentReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintStaffPendingPaymentReport(req.body)
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
router.post('/PrintPharmacyDiscountReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintPharmacyDiscountReport(req.body)
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
router.post('/PrintIPCancelReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintIPCancelReport(req.body)
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
router.post('/PrintPharmacyDueReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintPharmacyDueReport(req.body)
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
router.post('/PrintOPBillReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintOPBillReport(req.body)
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
router.post('/PrintIPBillReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintIPBillReport(req.body)
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
router.post('/PrintDirectBillReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintDirectBillReport(req.body)
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
router.post('/PrintPatientBillsByPatient', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintPatientBillsByPatient(req.body)
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
router.post('/PrintPatientBillsWithoutHeader', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintPatientBillsWithoutHeader(req.body)
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
router.post('/PrintPatientDGBillsWithoutHeader', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintPatientDGBillsWithoutHeader(req.body)
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
router.post('/Printopcreditbill', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.Printopcreditbill(req.body)
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
router.post('/PrintPharmacyBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintPharmacyBills(req.body)
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
router.post('/PrintPharmacyBills1', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintPharmacyBills1(req.body)
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
router.post('/PrintIPPharmacyBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintIPPharmacyBills(req.body)
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
router.post('/PrintOPPharmacyBillsforIP', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintOPPharmacyBillsforIP(req.body)
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
router.post('/PrintIPBillingPharmacyBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintIPBillingPharmacyBills(req.body)
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
router.post('/PrintOTBillingPharmacyBills', (req: Request, res: Response, next: NextFunction): any => {
    debugger;
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintOTBillingPharmacyBills(req.body)
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
router.post('/PopulateInpatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PopulateInpatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PopulateRoomCharges', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PopulateRoomCharges(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PopulateIPBillsWithoutAutoCharge', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PopulateIPBillsWithoutAutoCharge(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPendingOrders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetPendingOrders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMultiPendingOrders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetMultiPendingOrders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPendingProcedureOrders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetPendingProcedureOrders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPendingPrescriptions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetPendingPrescriptions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateIpParentId', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.UpdateIpParentId(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageIPBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.ManageIPBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ConsolidatePayment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.ConsolidatePayment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ConsolidatePharmacyPayment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.ConsolidatePharmacyPayment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintInPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintInPatientBills(req.body)
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
router.post('/NewPrintInpatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.NewPrintInpatientBills(req.body)
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
router.post('/PrintNonMedical', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintNonMedical(req.body)
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
router.post('/PrintInpatientBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintInpatientBillDetails(req.body)
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
router.post('/PrintDailyInpatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintDailyInpatientBills(req.body)
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
router.post('/PrintconsumerBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintconsumerBills(req.body)
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
router.post('/GetLastBillInfo', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.GetLastBillInfo(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DMPrintPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.DMPrintPatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DMPrintPharmacyBillsWithReturn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.DMPrintPharmacyBillsWithReturn(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintDMIPPharmacyBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintDMIPPharmacyBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/CancelIPPatientBill', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.CancelIPPatientBill(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintOPConsolidate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintOPConsolidate(req.body)
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
router.post('/PrintOPConsolidateWithoutPharmacy', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintOPConsolidateWithoutPharmacy(req.body)
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
router.post('/PrintConsolidatedPharmacybilldetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintConsolidatedPharmacybilldetails(req.body)
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
router.post('/PrintConsolidatedAllPharmacybilldetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintConsolidatedAllPharmacybilldetails(req.body)
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
router.post('/PrintConsolidatedOPbilldetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintConsolidatedOPbilldetails(req.body)
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
router.post('/PrintConsolidatedallbilldetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintConsolidatedallbilldetails(req.body)
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
router.post('/PrintPharmacyConsolidatedbill', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintPharmacyConsolidatedbill(req.body)
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
router.post('/PrintCollectionReportByCashier', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintCollectionReportByCashier(req.body)
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
router.post('/PrintPharmacyCollectionSummaryReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintPharmacyCollectionSummaryReport(req.body)
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
router.post('/PrintIPInsuranceReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintIPInsuranceReport(req.body)
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
router.post('/PrintPharmacyCollectionReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintPharmacyCollectionReport(req.body)
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
router.post('/PrintPharmacyCollectionAllCashier', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintPharmacyCollectionAllCashier(req.body)
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
router.post('/PrintIPPharmacyIssueReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintIPPharmacyIssueReport(req.body)
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
router.post('/PrintInsuranceAgingReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintInsuranceAgingReport(req.body)
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
router.post('/PrintReferralDoctorRevenueDetailsReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintReferralDoctorRevenueDetailsReport(req.body)
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
router.post('/PrintPharmacyClearance', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillsService, req);
    service.PrintPharmacyClearance(req.body)
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
export default router;
