import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { InventoryDashboardService } from '../Service/Index';

let router: Router = express.Router();

router.post('/GetInventoryDashboardOptions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InventoryDashboardService, req);
    service.GetInventoryDashboardOptions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
