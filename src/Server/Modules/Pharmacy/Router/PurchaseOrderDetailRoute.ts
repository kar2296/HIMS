import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PurchaseOrderDetailService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPurchaseOrderDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseOrderDetailService, req);
    service.AddPurchaseOrderDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePurchaseOrderDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseOrderDetailService, req);
    service.UpdatePurchaseOrderDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPurchaseOrderDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseOrderDetailService, req);
    service.GetPurchaseOrderDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPurchaseOrderDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseOrderDetailService, req);
    service.GetPurchaseOrderDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPendingPOReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseOrderDetailService, req);
    service.PrintPendingPOReport(req.body)
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
router.post('/PrintPurchaseOrderDetailReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseOrderDetailService, req);
    service.PrintPurchaseOrderDetailReport(req.body)
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
router.post('/DeletePurchaseOrderDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseOrderDetailService, req);
    service.DeletePurchaseOrderDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
