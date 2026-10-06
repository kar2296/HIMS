import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { VirtualBillService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddVirtualBill',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualBillService, req);
        service.AddVirtualBill(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateVirtualBill',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualBillService, req);
        service.UpdateVirtualBill(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetVirtualBillById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualBillService, req);
    service.GetVirtualBillById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVirtualBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualBillService, req);
    service.GetVirtualBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteVirtualBill', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualBillService, req);
    service.DeleteVirtualBill(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
