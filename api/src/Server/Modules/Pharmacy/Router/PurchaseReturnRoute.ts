import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PurchaseReturnService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPurchaseReturn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseReturnService, req);
    service.AddPurchaseReturn(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePurchaseReturn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseReturnService, req);
    service.UpdatePurchaseReturn(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePurchaseReturnTallyApprove', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseReturnService, req);
    service.ManagePurchaseReturnTallyApprove(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPurchaseReturnById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseReturnService, req);
    service.GetPurchaseReturnById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPurchaseReturns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseReturnService, req);
    service.GetPurchaseReturns(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePurchaseReturn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseReturnService, req);
    service.DeletePurchaseReturn(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPurchaseReturn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseReturnService, req);
    service.PrintPurchaseReturn(req.body)
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
router.post('/PrintPurchaseReturnList', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseReturnService, req);
    service.PrintPurchaseReturnList(req.body)
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
router.post('/PrintPurchaseReturnReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseReturnService, req);
    service.PrintPurchaseReturnReport(req.body)
        .then((response) => {
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
