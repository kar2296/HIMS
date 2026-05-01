import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { OrderFollowupService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddOrderFollowup', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrderFollowupService, req);
    service.AddOrderFollowup(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateOrderFollowup', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrderFollowupService, req);
    service.UpdateOrderFollowup(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOrderFollowupById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrderFollowupService, req);
    service.GetOrderFollowupById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageOrderFollowups', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrderFollowupService, req);
    service.ManageOrderFollowups(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOrderFollowups', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrderFollowupService, req);
    service.GetOrderFollowups(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteOrderFollowup', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrderFollowupService, req);
    service.DeleteOrderFollowup(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
