import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { VirtualMedicineOrderDetailService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddVirtualMedicineOrderDetail',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualMedicineOrderDetailService, req);
        service.AddVirtualMedicineOrderDetail(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateVirtualMedicineOrderDetail',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualMedicineOrderDetailService, req);
        service.UpdateVirtualMedicineOrderDetail(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetVirtualMedicineOrderDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualMedicineOrderDetailService, req);
    service.GetVirtualMedicineOrderDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVirtualMedicineOrderDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualMedicineOrderDetailService, req);
    service.GetVirtualMedicineOrderDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteVirtualMedicineOrderDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualMedicineOrderDetailService, req);
    service.DeleteVirtualMedicineOrderDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
