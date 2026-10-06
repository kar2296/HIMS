import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { OrderStatusService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddOrderStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrderStatusService, req);
    service.AddOrderStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateOrderStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrderStatusService, req);
    service.UpdateOrderStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOrderStatusById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrderStatusService, req);
    service.GetOrderStatusById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOrderStatuss', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrderStatusService, req);
    service.GetOrderStatuss(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteOrderStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrderStatusService, req);
    service.DeleteOrderStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
