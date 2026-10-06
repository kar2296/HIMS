import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { LisPatientOrderService } from '../Service/Index';

/** lis/patientorderdetails/* -- legacy LIS order screens, see Service/LisPatientOrderService.ts. */
const router: Router = express.Router();

router.post('/GetPatientOrderdetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LisPatientOrderService, req);
    service.GetPatientOrderdetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/ApprovePatientorderdetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LisPatientOrderService, req);
    service.ApproveOrderDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/CancelPatientorderdetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LisPatientOrderService, req);
    service.CancelOrderDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
