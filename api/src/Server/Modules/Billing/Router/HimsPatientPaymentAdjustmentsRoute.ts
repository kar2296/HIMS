import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientPaymentAdjustmentsService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientPaymentAdjustments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentAdjustmentsService, req);
    service.AddPatientPaymentAdjustments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientPaymentAdjustments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentAdjustmentsService, req);
    service.UpdatePatientPaymentAdjustments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientPaymentAdjustmentsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentAdjustmentsService, req);
    service.GetPatientPaymentAdjustmentsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientPaymentAdjustments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentAdjustmentsService, req);
    service.GetPatientPaymentAdjustments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientPaymentAdjustments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentAdjustmentsService, req);
    service.DeletePatientPaymentAdjustments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientFundAdjustmentReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientPaymentAdjustmentsService, req);
    service.PrintPatientFundAdjustmentReport(req.body)
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
