import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { PurchaseOrderService } from '../Service/Index';
import { unlinkSync } from 'fs';
import { AppConfig } from '../../../../config/index';
let router: Router = express.Router();

// router.post('/AddPurchaseOrder', (req: Request, res: Response, next: NextFunction): any => {
//     const service = ServiceFactory.CreateService(PurchaseOrderService, req);
//     service.AddPurchaseOrder(req.body)
//         .then((response) => { res.send(response); })
//         .catch(next);
// });
router.post('/AddPurchaseOrder',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PurchaseOrderService, req);
        service.AddPurchaseOrder(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdatePurchaseOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseOrderService, req);
    service.UpdatePurchaseOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UploadAttachment',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PurchaseOrderService, req);
        service.UploadAttachment(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetViewAttachment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseOrderService, req);
    service.GetViewAttachment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemFile', (req: Request, res: Response, next: NextFunction): any => {
    res.download(req.body.Data.Attachment);
});
router.post('/GetPurchaseOrderById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseOrderService, req);
    service.GetPurchaseOrderById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPurchaseOrderByIdWithoutDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseOrderService, req);
    service.GetPurchaseOrderByIdWithoutDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPurchaseOrders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseOrderService, req);
    service.GetPurchaseOrders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPurchaseOrderList', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseOrderService, req);
    service.GetPurchaseOrderList(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSelectedPurchaseOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseOrderService, req);
    service.GetSelectedPurchaseOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePurchaseOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseOrderService, req);
    service.DeletePurchaseOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPurchaseOrderList', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseOrderService, req);
    service.PrintPurchaseOrderList(req.body)
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
router.post('/PrintPurchaseOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseOrderService, req);
    service.PrintPurchaseOrder(req.body)
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
router.post('/PrintPurchaseOrderReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseOrderService, req);
    service.PrintPurchaseOrderReport(req.body)
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
router.post('/DMPrintPurchaseOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PurchaseOrderService, req);
    service.DMPrintPurchaseOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
