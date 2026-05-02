import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AssetDashboardService } from '../Service/Index';

let router: Router = express.Router();

router.post('/GetAssetDashboardOptions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetDashboardService, req);
    service.GetAssetDashboardOptions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
