import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { OPModifyPatPaymentDetailsService} from '../Service/Index';
import { unlinkSync } from 'fs';
let router: Router = express.Router();

router.post('/AddPatientPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OPModifyPatPaymentDetailsService, req);
    service.AddPatientPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientPaymentDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OPModifyPatPaymentDetailsService, req);
    service.GetPatientPaymentDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OPModifyPatPaymentDetailsService, req);
    service.GetPatientPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OPModifyPatPaymentDetailsService, req);
    service.PrintPatientPaymentDetails(req.body)
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
router.post('/DMPrintPatientPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OPModifyPatPaymentDetailsService, req);
    service.DMPrintPatientPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSystemDatetime', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OPModifyPatPaymentDetailsService, req);
    service.GetSystemDatetime(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
