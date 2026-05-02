import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { VirtualBillDetailService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddVirtualBillDetail',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualBillDetailService, req);
        service.AddVirtualBillDetail(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateVirtualBillDetail',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualBillDetailService, req);
        service.UpdateVirtualBillDetail(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetVirtualBillDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualBillDetailService, req);
    service.GetVirtualBillDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVirtualBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualBillDetailService, req);
    service.GetVirtualBillDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteVirtualBillDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualBillDetailService, req);
    service.DeleteVirtualBillDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
