import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { TreatmentPlanFollowupService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddTreatmentPlanFollowup', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatmentPlanFollowupService, req);
    service.AddTreatmentPlanFollowup(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateTreatmentPlanFollowup', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatmentPlanFollowupService, req);
    service.UpdateTreatmentPlanFollowup(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTreatmentPlanFollowupById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatmentPlanFollowupService, req);
    service.GetTreatmentPlanFollowupById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageTreatmentPlanFollowups', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatmentPlanFollowupService, req);
    service.ManageTreatmentPlanFollowups(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTreatmentPlanFollowups', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatmentPlanFollowupService, req);
    service.GetTreatmentPlanFollowups(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteTreatmentPlanFollowup', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatmentPlanFollowupService, req);
    service.DeleteTreatmentPlanFollowup(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
