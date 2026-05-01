import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { LocalWellCustomerOrderService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddLocalWellCustomerOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LocalWellCustomerOrderService, req);
    service.AddLocalWellCustomerOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateLocalWellCustomerOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LocalWellCustomerOrderService, req);
    service.UpdateLocalWellCustomerOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/SearchMedicine', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LocalWellCustomerOrderService, req);
    service.SearchMedicine(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddCustomerOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LocalWellCustomerOrderService, req);
    service.AddCustomerOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOrderStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LocalWellCustomerOrderService, req);
    service.GetOrderStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLocalWellCustomerOrderById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LocalWellCustomerOrderService, req);
    service.GetLocalWellCustomerOrderById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLocalWellCustomerOrders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LocalWellCustomerOrderService, req);
    service.GetLocalWellCustomerOrders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteLocalWellCustomerOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LocalWellCustomerOrderService, req);
    service.DeleteLocalWellCustomerOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
