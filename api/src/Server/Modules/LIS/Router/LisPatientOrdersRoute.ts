import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { LisPatientOrderService } from '../Service/Index';

/** lis/patientorders/* -- legacy LIS order screens, see Service/LisPatientOrderService.ts. */
const router: Router = express.Router();

router.post('/GetPatientOrders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LisPatientOrderService, req);
    service.GetPatientOrders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
