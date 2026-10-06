import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientAdmissionLogService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientAdmissionLog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAdmissionLogService, req);
    service.AddPatientAdmissionLog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientAdmissionLog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAdmissionLogService, req);
    service.UpdatePatientAdmissionLog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientAdmissionLogById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAdmissionLogService, req);
    service.GetPatientAdmissionLogById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientAdmissionLogs', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAdmissionLogService, req);
    service.GetPatientAdmissionLogs(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientAdmissionLog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAdmissionLogService, req);
    service.DeletePatientAdmissionLog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
