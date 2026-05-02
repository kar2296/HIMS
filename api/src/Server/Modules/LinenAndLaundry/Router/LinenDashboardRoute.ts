import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { LinenDashboardService } from '../Service/Index';

let router: Router = express.Router();

router.post('/GetLinenDashboardOptions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenDashboardService, req);
    service.GetLinenDashboardOptions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
