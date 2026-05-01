import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { RevenueService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddRevenue', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RevenueService, req);
    service.AddRevenue(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateRevenue', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RevenueService, req);
    service.UpdateRevenue(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRevenueById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RevenueService, req);
    service.GetRevenueById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRevenues', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RevenueService, req);
    service.GetRevenues(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteRevenue', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RevenueService, req);
    service.DeleteRevenue(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
