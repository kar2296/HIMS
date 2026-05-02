import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientDischargeEventService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientDischargeEvent', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDischargeEventService, req);
    service.AddPatientDischargeEvent(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientDischargeEvent', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDischargeEventService, req);
    service.UpdatePatientDischargeEvent(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientDischargeEventByDiagnosis', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDischargeEventService, req);
    service.UpdatePatientDischargeEventByDiagnosis(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDischargeEventById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDischargeEventService, req);
    service.GetPatientDischargeEventById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDischargeEventByEncounterId', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDischargeEventService, req);
    service.GetPatientDischargeEventByEncounterId(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDischargeEvents', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDischargeEventService, req);
    service.GetPatientDischargeEvents(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientDischargeEvent', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDischargeEventService, req);
    service.DeletePatientDischargeEvent(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
