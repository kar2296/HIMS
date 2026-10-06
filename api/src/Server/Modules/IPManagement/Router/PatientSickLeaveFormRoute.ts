import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientSickLeaveFormService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientSickLeaveForm', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSickLeaveFormService, req);
    service.AddPatientSickLeaveForm(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientSickLeaveForm', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSickLeaveFormService, req);
    service.UpdatePatientSickLeaveForm(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientSickLeaveFormById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSickLeaveFormService, req);
    service.GetPatientSickLeaveFormById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientSickLeaveForm', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSickLeaveFormService, req);
    service.GetPatientSickLeaveForm(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientSickLeaveForm', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSickLeaveFormService, req);
    service.DeletePatientSickLeaveForm(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientSickLeaveForm', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSickLeaveFormService, req);
    service.PrintPatientSickLeaveForm(req.body)
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
