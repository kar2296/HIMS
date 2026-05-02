import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StaffCreditPaymentService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddStaffCreditPayment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StaffCreditPaymentService, req);
    service.AddStaffCreditPayment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStaffCreditPayment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StaffCreditPaymentService, req);
    service.UpdateStaffCreditPayment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStaffCreditPaymentById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StaffCreditPaymentService, req);
    service.GetStaffCreditPaymentById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStaffCreditPayments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StaffCreditPaymentService, req);
    service.GetStaffCreditPayments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStaffCreditPayment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StaffCreditPaymentService, req);
    service.DeleteStaffCreditPayment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintStaffCreditPayment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StaffCreditPaymentService, req);
    service.PrintStaffCreditPayment(req.body)
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
router.post('/PrintStaffCreditPaymentReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StaffCreditPaymentService, req);
    service.PrintStaffCreditPaymentReport(req.body)
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
