import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { InsurancePaymentService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddInsurancePayment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InsurancePaymentService, req);
    service.AddInsurancePayment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateInsurancePayment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InsurancePaymentService, req);
    service.UpdateInsurancePayment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetInsurancePaymentById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InsurancePaymentService, req);
    service.GetInsurancePaymentById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetInsurancePayments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InsurancePaymentService, req);
    service.GetInsurancePayments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintInsurancePayments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InsurancePaymentService, req);
    service.PrintInsurancePayments(req.body)
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
router.post('/PrintInsuranceReceiptReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InsurancePaymentService, req);
    service.PrintInsuranceReceiptReport(req.body)
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
router.post('/DeleteInsurancePayment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InsurancePaymentService, req);
    service.DeleteInsurancePayment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
