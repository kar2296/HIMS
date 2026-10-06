import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { VendorPaymentService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddVendorPayment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorPaymentService, req);
    service.AddVendorPayment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateVendorPayment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorPaymentService, req);
    service.UpdateVendorPayment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVendorPaymentById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorPaymentService, req);
    service.GetVendorPaymentById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVendorPayments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorPaymentService, req);
    service.GetVendorPayments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSupplierPendingSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorPaymentService, req);
    service.GetSupplierPendingSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintVendorPayment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorPaymentService, req);
    service.PrintVendorPayment(req.body)
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
router.post('/PrintVendorPaymentReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorPaymentService, req);
    service.PrintVendorPaymentReport(req.body)
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
router.post('/DeleteVendorPayment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorPaymentService, req);
    service.DeleteVendorPayment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintSupplierPendingSummaryReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorPaymentService, req);
    service.PrintSupplierPendingSummaryReport(req.body)
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
