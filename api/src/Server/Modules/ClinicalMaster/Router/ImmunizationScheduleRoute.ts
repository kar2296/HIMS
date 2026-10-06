import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ImmunizationScheduleService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddImmunizationSchedule', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ImmunizationScheduleService, req);
    service.AddImmunizationSchedule(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateImmunizationSchedule', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ImmunizationScheduleService, req);
    service.UpdateImmunizationSchedule(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetImmunizationScheduleById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ImmunizationScheduleService, req);
    service.GetImmunizationScheduleById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetImmunizationSchedules', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ImmunizationScheduleService, req);
    service.GetImmunizationSchedules(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteImmunizationSchedule', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ImmunizationScheduleService, req);
    service.DeleteImmunizationSchedule(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
