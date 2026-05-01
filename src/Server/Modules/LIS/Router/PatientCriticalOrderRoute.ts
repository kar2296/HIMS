import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientCriticalOrderService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientCriticalOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCriticalOrderService, req);
    service.AddPatientCriticalOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientCriticalOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCriticalOrderService, req);
    service.UpdatePatientCriticalOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientCriticalOrderById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCriticalOrderService, req);
    service.GetPatientCriticalOrderById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientCriticalOrders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCriticalOrderService, req);
    service.GetPatientCriticalOrders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientCriticalOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCriticalOrderService, req);
    service.DeletePatientCriticalOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientCriticalOrderReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCriticalOrderService, req);
    service.PrintPatientCriticalOrderReport(req.body)
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
