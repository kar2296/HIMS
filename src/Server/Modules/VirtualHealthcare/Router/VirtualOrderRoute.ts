import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { VirtualOrderService } from '../Service/Index';
import { unlinkSync } from 'fs';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddVirtualOrder',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualOrderService, req);
        service.AddVirtualOrder(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateVirtualOrderPaymentgateway',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualOrderService, req);
        service.UpdateVirtualOrderPaymentgateway(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
// router.post('/UpdateVaccineCard',
//     (req: Request, res: Response, next: NextFunction): any => {
//         FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
//     },
//     (req: Request, res: Response, next: NextFunction): any => {
//         const service = ServiceFactory.CreateService(VirtualOrderService, req);
//         service.UpdateVaccineCard(req.body)
//             .then((response) => { res.send(response); })
//             .catch(next);
//     });
router.post('/UpdateVirtualOrder',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualOrderService, req);
        service.UpdateVirtualOrder(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateRescheduleVirtualOrder',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualOrderService, req);
        service.UpdateRescheduleVirtualOrder(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
// router.post('/UpdateRescheduleDiagnosticOrder',
//     (req: Request, res: Response, next: NextFunction): any => {
//         FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
//     },
//     (req: Request, res: Response, next: NextFunction): any => {
//         const service = ServiceFactory.CreateService(VirtualOrderService, req);
//         service.UpdateRescheduleDiagnosticOrder(req.body)
//             .then((response) => { res.send(response); })
//             .catch(next);
//     });
router.post('/AddDoctorConsultVirtualOrder',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualOrderService, req);
        service.AddDoctorConsultVirtualOrder(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
// router.post('/AddVaccineCardOrder',
//     (req: Request, res: Response, next: NextFunction): any => {
//         FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
//     },
//     (req: Request, res: Response, next: NextFunction): any => {
//         const service = ServiceFactory.CreateService(VirtualOrderService, req);
//         service.AddVaccineCardOrder(req.body)
//             .then((response) => { res.send(response); })
//             .catch(next);
//     });
router.post('/GetVaccineCardPic', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualOrderService, req);
    service.GetVaccineCardPic(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
// router.post('/GetAttachmentFile', (req, res, next) => {
//     const service = ServiceFactory.CreateService(VirtualOrderService, req);
//     service.GetAttachmentFile(req.body)
//         .then((response) => { res.send(response); })
//         .catch(next);
// });
router.post('/GetAttachmentFile', (req: Request, res: Response, next: NextFunction): any => {
    res.download(req.body.Data.ProofIdentify);
});
// router.post('/UpdateVirtualLabOrder',
//     (req: Request, res: Response, next: NextFunction): any => {
//         const service = ServiceFactory.CreateService(VirtualOrderService, req);
//         service.UpdateVirtualLabOrder(req.body)
//             .then((response) => { res.send(response); })
//             .catch(next);
//     });
router.post('/GetProofIdentifyFile', (req: Request, res: Response, next: NextFunction): any => {
    res.download(req.body.Data.ProofIdentify);
});
router.post('/ConfirmVirtualOrder',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualOrderService, req);
        service.ConfirmVirtualOrder(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/AssignVirtualOrder',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualOrderService, req);
        service.AssignVirtualOrder(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetVirtualOrderById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualOrderService, req);
    service.GetVirtualOrderById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVirtualOrders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualOrderService, req);
    service.GetVirtualOrders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteVirtualOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualOrderService, req);
    service.DeleteVirtualOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintVirtualAppoinmentReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualOrderService, req);
    service.PrintVirtualAppoinmentReport(req.body)
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
router.post('/PrintCancelAppoinmentReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualOrderService, req);
    service.PrintCancelAppoinmentReport(req.body)
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
router.post('/PrintLabOnlinePaymentReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualOrderService, req);
    service.PrintLabOnlinePaymentReport(req.body)
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
router.post('/PrintOnlinePaymentDetailsReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualOrderService, req);
    service.PrintOnlinePaymentDetailsReport(req.body)
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
router.post('/PrintOnlinePaymentSummaryReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualOrderService, req);
    service.PrintOnlinePaymentSummaryReport(req.body)
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
