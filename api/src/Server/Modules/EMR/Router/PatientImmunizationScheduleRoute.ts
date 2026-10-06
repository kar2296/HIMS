import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientImmunizationScheduleService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientImmunizationSchedule', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientImmunizationScheduleService, req);
    service.AddPatientImmunizationSchedule(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientImmunizationSchedule', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientImmunizationScheduleService, req);
    service.UpdatePatientImmunizationSchedule(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientImmunizationScheduleById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientImmunizationScheduleService, req);
    service.GetPatientImmunizationScheduleById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientImmunizationSchedules', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientImmunizationScheduleService, req);
    service.GetPatientImmunizationSchedules(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientImmunizationSchedule', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientImmunizationScheduleService, req);
    service.DeletePatientImmunizationSchedule(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
