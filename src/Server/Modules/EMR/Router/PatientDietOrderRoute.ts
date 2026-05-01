import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientDietOrderService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientDietOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietOrderService, req);
    service.AddPatientDietOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientDietOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietOrderService, req);
    service.UpdatePatientDietOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDietOrderById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietOrderService, req);
    service.GetPatientDietOrderById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientDietOrders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietOrderService, req);
    service.ManagePatientDietOrders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDietOrders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietOrderService, req);
    service.GetPatientDietOrders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientDietOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietOrderService, req);
    service.DeletePatientDietOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientDietOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietOrderService, req);
    service.PrintPatientDietOrder(req.body)
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
    router.post('/PrintKitchenworklist', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietOrderService, req);
    service.PrintKitchenworklist(req.body)
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
