import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientAlertService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientAlert', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAlertService, req);
    service.AddPatientAlert(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientAlert', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAlertService, req);
    service.UpdatePatientAlert(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientAlertById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAlertService, req);
    service.GetPatientAlertById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientAlerts', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAlertService, req);
    service.GetPatientAlerts(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientAlert', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAlertService, req);
    service.DeletePatientAlert(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
