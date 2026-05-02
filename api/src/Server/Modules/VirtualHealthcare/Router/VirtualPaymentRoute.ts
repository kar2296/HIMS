import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { VirtualPaymentService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddVirtualPayment',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualPaymentService, req);
        service.AddVirtualPayment(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateVirtualPayment',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualPaymentService, req);
        service.UpdateVirtualPayment(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetVirtualPaymentById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualPaymentService, req);
    service.GetVirtualPaymentById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVirtualPayments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualPaymentService, req);
    service.GetVirtualPayments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteVirtualPayment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualPaymentService, req);
    service.DeleteVirtualPayment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
