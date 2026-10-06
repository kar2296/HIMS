import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { TreatmentPlanService } from '../Service/Index';
//import { unlinkSync } from 'fs';
let router: Router = express.Router();

router.post('/AddTreatmentPlan', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatmentPlanService, req);
    service.AddTreatmentPlan(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateTreatmentPlan', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatmentPlanService, req);
    service.UpdateTreatmentPlan(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateTreatmentPlanBillInfo', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatmentPlanService, req);
    service.UpdateTreatmentPlanBillInfo(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTreatmentPlanById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatmentPlanService, req);
    service.GetTreatmentPlanById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTreatmentPlans', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatmentPlanService, req);
    service.GetTreatmentPlans(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteTreatmentPlan', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatmentPlanService, req);
    service.DeleteTreatmentPlan(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
