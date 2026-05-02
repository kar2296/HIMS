import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { VirtualOrderService } from '../../VirtualHealthcare/Service/Index';
let router: Router = express.Router();

router.post('/GetVirtualOrders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualOrderService, req);
    service.GetVirtualOrders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
