import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { OtDashboardService } from '../Service/Index';

let router: Router = express.Router();

router.post('/GetOtDashboardOptions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtDashboardService, req);
    service.GetOtDashboardOptions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
