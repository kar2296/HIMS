import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientDietPlanService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientDietPlan', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietPlanService, req);
    service.AddPatientDietPlan(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientDietPlan', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietPlanService, req);
    service.UpdatePatientDietPlan(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDietPlanById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietPlanService, req);
    service.GetPatientDietPlanById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDietPlans', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietPlanService, req);
    service.GetPatientDietPlans(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientDietPlan', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietPlanService, req);
    service.DeletePatientDietPlan(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
