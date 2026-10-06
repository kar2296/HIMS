import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { OrderTypeService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddOrderType', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrderTypeService, req);
    service.AddOrderType(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateOrderType', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrderTypeService, req);
    service.UpdateOrderType(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOrderTypeById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrderTypeService, req);
    service.GetOrderTypeById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOrderTypes', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrderTypeService, req);
    service.GetOrderTypes(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteOrderType', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrderTypeService, req);
    service.DeleteOrderType(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
