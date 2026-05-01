import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientOrderStatusService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientOrderStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderStatusService, req);
    service.AddPatientOrderStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientOrderStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderStatusService, req);
    service.UpdatePatientOrderStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientOrderStatusById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderStatusService, req);
    service.GetPatientOrderStatusById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientOrderStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderStatusService, req);
    service.GetPatientOrderStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientOrderStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderStatusService, req);
    service.DeletePatientOrderStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
