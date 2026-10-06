import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientWorkorderService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientWorkorder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.AddPatientWorkorder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientWorkorder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.UpdatePatientWorkorder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePrintPatientWorkorder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.UpdatePrintPatientWorkorder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AssignExternalProvider', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.AssignExternalProvider(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/CompleteExternalProvider', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.CompleteExternalProvider(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientWorkOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.ManagePatientWorkOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientWorkorderById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.GetPatientWorkorderById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientWorkorders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.GetPatientWorkorders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMinPatientWorkorders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.GetMinPatientWorkorders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVirtualPatientWorkorders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.GetVirtualPatientWorkorders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientWorkorder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.DeletePatientWorkorder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AssignOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.AssignOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AssignOrderById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.AssignOrderById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AcceptOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.AcceptOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/updateOrderStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.updateOrderStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AcceptVirtualOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.AcceptVirtualOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/CancelOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.CancelOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/CancelBillOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.CancelBillOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DispatchResult', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.DispatchResult(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientWorkorder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.PrintPatientWorkorder(req.body)
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
router.post('/PrintPatientWorkorderArray', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.PrintPatientWorkorderArray(req.body)
        .then((response: any) => {
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
router.post('/PrintPatientWorkorderWithoutheader', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.PrintPatientWorkorderWithoutheader(req.body)
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
router.post('/PrintVirtualPatientWorkorder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.PrintVirtualPatientWorkorder(req.body)
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
router.post('/PrintExternallabSlip', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.PrintExternallabSlip(req.body)
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
router.post('/Printmicrobiology', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.Printmicrobiology(req.body)
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
router.post('/Printpathaology', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.Printpathaology(req.body)
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
router.post('/PrintExternalLab', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.PrintExternalLab(req.body)
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
router.post('/Printecho', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.Printecho(req.body)
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
router.post('/printWorkSheet', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.printWorkSheet(req.body)
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
router.post('/Printendoscopy', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.Printendoscopy(req.body)
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
router.post('/PrintERCP', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.PrintERCP(req.body)
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
router.post('/PrintLabRedoReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderService, req);
    service.PrintLabRedoReport(req.body)
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
