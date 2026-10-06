import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DoctorPaymentService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddDoctorPayment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorPaymentService, req);
    service.AddDoctorPayment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDoctorPayment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorPaymentService, req);
    service.UpdateDoctorPayment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDoctorPaymentById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorPaymentService, req);
    service.GetDoctorPaymentById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDoctorPayments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorPaymentService, req);
    service.GetDoctorPayments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteDoctorPayment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorPaymentService, req);
    service.DeleteDoctorPayment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintDoctorPayment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorPaymentService, req);
    service.PrintDoctorPayment(req.body)
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
router.post('/PrintDoctorPaymentReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorPaymentService, req);
    service.PrintDoctorPaymentReport(req.body)
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
