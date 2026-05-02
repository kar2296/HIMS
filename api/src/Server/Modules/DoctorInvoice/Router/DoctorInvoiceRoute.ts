import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DoctorInvoiceService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddDoctorInvoice', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorInvoiceService, req);
    service.AddDoctorInvoice(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDoctorInvoice', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorInvoiceService, req);
    service.UpdateDoctorInvoice(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDoctorInvoiceById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorInvoiceService, req);
    service.GetDoctorInvoiceById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDoctorInvoices', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorInvoiceService, req);
    service.GetDoctorInvoices(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/getExcuteStoredProcedure', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorInvoiceService, req);
    service.getExcuteStoredProcedure(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteDoctorInvoice', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorInvoiceService, req);
    service.DeleteDoctorInvoice(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintDoctorInvoice', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorInvoiceService, req);
    service.PrintDoctorInvoice(req.body)
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
router.post('/PrintDoctorInvoiceTds', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorInvoiceService, req);
    service.PrintDoctorInvoiceTds(req.body)
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
router.post('/PrintDoctorInvoiceReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorInvoiceService, req);
    service.PrintDoctorInvoiceReport(req.body)
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
router.post('/PrintOutstandingPaymentReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorInvoiceService, req);
    service.PrintOutstandingPaymentReport(req.body)
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
