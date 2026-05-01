import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { GrnService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddGrn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnService, req);
    service.AddGrn(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateGrn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnService, req);
    service.UpdateGrn(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateSubmission', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnService, req);
    service.UpdateSubmission(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePoGrn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnService, req);
    service.UpdatePoGrn(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGrnById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnService, req);
    service.GetGrnById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGrnByIdwoDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnService, req);
    service.GetGrnByIdwoDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGrns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnService, req);
    service.GetGrns(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePurchaseTallyApprove', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnService, req);
    service.ManagePurchaseTallyApprove(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGrnList', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnService, req);
    service.GetGrnList(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTodayGrns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnService, req);
    service.GetTodayGrns(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteGrn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnService, req);
    service.DeleteGrn(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSupplierInvoiceSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnService, req);
    service.GetSupplierInvoiceSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVendorOutstandings', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnService, req);
    service.GetVendorOutstandings(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintGrn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnService, req);
    service.PrintGrn(req.body)
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
router.post('/Print1Grn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnService, req);
    service.Print1Grn(req.body)
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
router.post('/PrintGRNReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnService, req);
    service.PrintGRNReport(req.body)
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
router.post('/PrintVendorOutstandingReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnService, req);
    service.PrintVendorOutstandingReport(req.body)
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
router.post('/PrintVendorPendingPaymentReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnService, req);
    service.PrintVendorPendingPaymentReport(req.body)
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
router.post('/DMPrintGrn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnService, req);
    service.DMPrintGrn(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintInvoiceSummarySupplierReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnService, req);
    service.PrintInvoiceSummarySupplierReport(req.body)
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
