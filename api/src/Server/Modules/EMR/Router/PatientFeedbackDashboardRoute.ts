import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientFeedbackDashboardService } from '../Service/Index';

let router: Router = express.Router();

router.post('/GetPatientFeedbackDashboardOptions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientFeedbackDashboardService, req);
    service.GetPatientFeedbackDashboardOptions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
