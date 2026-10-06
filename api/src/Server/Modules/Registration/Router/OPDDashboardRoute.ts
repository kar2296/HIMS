import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { OPDDashboardService } from '../Service/Index';

let router: Router = express.Router();

router.post('/GetOPDDashboardOptions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OPDDashboardService, req);
    service.GetOPDDashboardOptions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
