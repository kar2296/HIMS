import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PurchaseRequestService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPurchaseRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseRequestService, req);
    service.AddPurchaseRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePurchaseRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseRequestService, req);
    service.UpdatePurchaseRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPurchaseRequestById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseRequestService, req);
    service.GetPurchaseRequestById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPurchaseRequests', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseRequestService, req);
    service.GetPurchaseRequests(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePurchaseRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseRequestService, req);
    service.DeletePurchaseRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPurchaseRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseRequestService, req);
    service.PrintPurchaseRequest(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});

export default router;
