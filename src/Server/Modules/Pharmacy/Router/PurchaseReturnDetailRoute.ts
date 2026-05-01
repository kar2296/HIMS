import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PurchaseReturnDetailService } from '../Service/Index';
import { unlinkSync } from 'fs';


let router: Router = express.Router();

router.post('/AddPurchaseReturnDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseReturnDetailService, req);
    service.AddPurchaseReturnDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePurchaseReturnDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseReturnDetailService, req);
    service.UpdatePurchaseReturnDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPurchaseReturnDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseReturnDetailService, req);
    service.GetPurchaseReturnDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPurchaseReturnDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseReturnDetailService, req);
    service.GetPurchaseReturnDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PurchaseReturnGSTDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseReturnDetailService, req);
    service.PurchaseReturnGSTDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePurchaseReturnDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseReturnDetailService, req);
    service.DeletePurchaseReturnDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPurchaseReturnGSTReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseReturnDetailService, req);
    service.PrintPurchaseReturnGSTReport(req.body)
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
