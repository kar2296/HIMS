import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { VirtualMedicineOrderService } from '../Service/Index';
import { unlinkSync } from 'fs';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddVirtualMedicineOrder',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualMedicineOrderService, req);
        service.AddVirtualMedicineOrder(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateVirtualMedicineOrder',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualMedicineOrderService, req);
        service.UpdateVirtualMedicineOrder(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
// router.post('/GetAttachmentFile', (req: Request, res: Response, next: NextFunction): any => {
//     const service = ServiceFactory.CreateService(VirtualMedicineOrderService, req);
//     service.GetAttachmentFile(req.body)
//         .then((response) => { res.send(response); })
//         .catch(next);
// });
router.post('/UpdateVirtualMedicineOrderDelivery',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualMedicineOrderService, req);
        service.UpdateVirtualMedicineOrderDelivery(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
// router.post('/GetInvoiceAttachmentFile', (req: Request, res: Response, next: NextFunction): any => {
//     const service = ServiceFactory.CreateService(VirtualMedicineOrderService, req);
//     service.GetInvoiceAttachmentFile(req.body)
//         .then((response) => { res.send(response); })
//         .catch(next);
// });
// router.post('/GetAttachmentFile', (req: Request, res: Response, next: NextFunction): any => {
//     res.download(req.body.Data.PrescriptionAttachment);
// });
router.post('/GetAttachmentFile', (req, res, next) => {
    const service = ServiceFactory.CreateService(VirtualMedicineOrderService, req);
    service.GetAttachmentFile(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetInvoiceAttachmentFile', (req: Request, res: Response, next: NextFunction): any => {
    res.download(req.body.Data.InvoiceAttachment);
});
router.post('/GetPrescriptionAttachmentFile', (req: Request, res: Response, next: NextFunction): any => {
    res.download(req.body.Data.PrescriptionAttachment);
});
router.post('/GetVirtualMedicineOrderById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualMedicineOrderService, req);
    service.GetVirtualMedicineOrderById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVirtualMedicineOrders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualMedicineOrderService, req);
    service.GetVirtualMedicineOrders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDrugSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualMedicineOrderService, req);
    service.GetDrugSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteVirtualMedicineOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualMedicineOrderService, req);
    service.DeleteVirtualMedicineOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintDrugSummaryReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualMedicineOrderService, req);
    service.PrintDrugSummaryReport(req.body)
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
