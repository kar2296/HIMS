import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DoctorDashboardService} from '../Service/Index';

let router: Router = express.Router();

router.post('/GetDashboardOptions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorDashboardService, req);
    service.GetDashboardOptions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
