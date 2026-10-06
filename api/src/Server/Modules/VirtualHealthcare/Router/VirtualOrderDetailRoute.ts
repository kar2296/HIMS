import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { VirtualOrderDetailService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddVirtualOrderDetail',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualOrderDetailService, req);
        service.AddVirtualOrderDetail(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateVirtualOrderDetail',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualOrderDetailService, req);
        service.UpdateVirtualOrderDetail(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetVirtualOrderDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualOrderDetailService, req);
    service.GetVirtualOrderDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVirtualOrderDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualOrderDetailService, req);
    service.GetVirtualOrderDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteVirtualOrderDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualOrderDetailService, req);
    service.DeleteVirtualOrderDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
