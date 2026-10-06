import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PurchaseRequestDetailService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPurchaseRequestDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseRequestDetailService, req);
    service.AddPurchaseRequestDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePurchaseRequestDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseRequestDetailService, req);
    service.UpdatePurchaseRequestDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPurchaseRequestDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseRequestDetailService, req);
    service.GetPurchaseRequestDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPurchaseRequestDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseRequestDetailService, req);
    service.GetPurchaseRequestDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePurchaseRequestDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseRequestDetailService, req);
    service.DeletePurchaseRequestDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
