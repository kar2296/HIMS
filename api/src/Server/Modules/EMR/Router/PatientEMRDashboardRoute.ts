import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientEMRDashboardService } from '../Service/Index';

let router: Router = express.Router();

router.post('/GetPatientEMRDashboardOptions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientEMRDashboardService, req);
    service.GetPatientEMRDashboardOptions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
