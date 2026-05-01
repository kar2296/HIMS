import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { RevenueTargetService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddRevenueTarget', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RevenueTargetService, req);
    service.AddRevenueTarget(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateRevenueTarget', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RevenueTargetService, req);
    service.UpdateRevenueTarget(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRevenueTargetById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RevenueTargetService, req);
    service.GetRevenueTargetById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRevenueTargets', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RevenueTargetService, req);
    service.GetRevenueTargets(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteRevenueTarget', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RevenueTargetService, req);
    service.DeleteRevenueTarget(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
