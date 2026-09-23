import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { LisPatientOrderService } from '../Service/Index';

/** lis/encounterorderdetails/* -- legacy LIS order screens, see Service/LisPatientOrderService.ts. */
const router: Router = express.Router();

router.post('/ApproveEncounterorderdetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LisPatientOrderService, req);
    service.ApproveOrderDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/CancelEncounterorderdetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LisPatientOrderService, req);
    service.CancelOrderDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
