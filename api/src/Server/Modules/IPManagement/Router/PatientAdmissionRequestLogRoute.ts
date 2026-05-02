import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientAdmissionRequestLogService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientAdmissionRequestLog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAdmissionRequestLogService, req);
    service.AddPatientAdmissionRequestLog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientAdmissionRequestLog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAdmissionRequestLogService, req);
    service.UpdatePatientAdmissionRequestLog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientAdmissionRequestLogById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAdmissionRequestLogService, req);
    service.GetPatientAdmissionRequestLogById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientAdmissionRequestLogs', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAdmissionRequestLogService, req);
    service.GetPatientAdmissionRequestLogs(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientAdmissionRequestLog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAdmissionRequestLogService, req);
    service.DeletePatientAdmissionRequestLog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
