import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientOrderService } from '../Service/Index';
import { unlinkSync } from 'fs';
let router: Router = express.Router();

router.post('/AddPatientOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.AddPatientOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddPatientOrderWithExecutableProcedures', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.AddPatientOrderWithExecutableProcedures(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.UpdatePatientOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateOrderStatusPatientOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.UpdateOrderStatusPatientOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCancelPatientOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.UpdateCancelPatientOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCancelclinicalPatientOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.UpdateCancelclinicalPatientOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateorderCancelPatientOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.UpdateorderCancelPatientOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientOrders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.ManagePatientOrders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientOrderReview', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.UpdatePatientOrderReview(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientOrderById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.GetPatientOrderById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMinPatientOrderById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.GetMinPatientOrderById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientOrderByIdWithoutDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.GetPatientOrderByIdWithoutDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientOrderWithDetailsByBillingId', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.GetPatientOrderWithDetailsByBillingId(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientOrders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.GetPatientOrders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientOrdersforPreviousOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.GetPatientOrdersforPreviousOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMinPatientOrders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.GetMinPatientOrders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientOrderWithoutDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.GetPatientOrderWithoutDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.DeletePatientOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.PrintPatientOrder(req.body)
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
router.post('/PrintPatientOrderInv', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.PrintPatientOrderInv(req.body)
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
router.post('/GetOrderHtml', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.GetOrderHtml(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientOrders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.PrintPatientOrders(req.body)
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
router.post('/PrintPatientOrdersWithoutHeader', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.PrintPatientOrdersWithoutHeader(req.body)
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
router.post('/PrintConsolidatedLabResult', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.PrintConsolidatedLabResult(req.body)
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
router.post('/PrintConsolidatedRadiologyResult', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.PrintConsolidatedRadiologyResult(req.body)
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
router.post('/Printpreviousrisresults', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.Printpreviousrisresults(req.body)
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
router.post('/Printpreviousendoscopyresults', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.Printpreviousendoscopyresults(req.body)
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
router.post('/UpdateLabConsultationNote', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderService, req);
    service.UpdateLabConsultationNote(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
