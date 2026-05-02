import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientDietPlanLogService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientDietPlanLog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietPlanLogService, req);
    service.AddPatientDietPlanLog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientDietPlanLog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietPlanLogService, req);
    service.UpdatePatientDietPlanLog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDietPlanLogById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietPlanLogService, req);
    service.GetPatientDietPlanLogById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PatientDietPlanLogs', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietPlanLogService, req);
    service.GetPatientDietPlanLogs(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientDietPlanLog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietPlanLogService, req);
    service.DeletePatientDietPlanLog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
