import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientFeedbackDetailsService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientFeedbackDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientFeedbackDetailsService, req);
    service.AddPatientFeedbackDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientFeedbackDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientFeedbackDetailsService, req);
    service.UpdatePatientFeedbackDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientFeedbackDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientFeedbackDetailsService, req);
    service.GetPatientFeedbackDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientFeedbackDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientFeedbackDetailsService, req);
    service.ManagePatientFeedbackDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientFeedbackDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientFeedbackDetailsService, req);
    service.GetPatientFeedbackDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientFeedbackSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientFeedbackDetailsService, req);
    service.GetPatientFeedbackSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientFeedbackDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientFeedbackDetailsService, req);
    service.DeletePatientFeedbackDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientFeedbacksummaryforop', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientFeedbackDetailsService, req);
    service.PrintPatientFeedbacksummaryforop(req.body)
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
router.post('/PrintPatientFeedbacksummaryforip', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientFeedbackDetailsService, req);
    service.PrintPatientFeedbacksummaryforip(req.body)
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
