import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PharmacyModifyPatBillsService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
    service.AddPatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFindPharmacyBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
    service.GetFindPharmacyBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientPharmacyBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
    service.GetPatientPharmacyBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFindPatientPharmacyBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
    service.GetFindPatientPharmacyBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBillsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
    service.GetPatientBillsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
    service.GetPatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFindPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
    service.GetFindPatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
    service.DeletePatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
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
router.post('/PrintPatientBillsByPatient', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
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
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
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
router.post('/Printopcreditbill', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
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
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
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
router.post('/PrintIPPharmacyBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
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
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
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
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
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
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
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
router.post('/GetPendingOrders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
    service.GetPendingOrders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPendingPrescriptions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
    service.GetPendingPrescriptions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintInPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
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
router.post('/PrintDailyInpatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
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
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
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
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
    service.GetLastBillInfo(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DMPrintPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
    service.DMPrintPatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintDMIPPharmacyBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
    service.PrintDMIPPharmacyBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintOPConsolidate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PharmacyModifyPatBillsService, req);
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
export default router;
