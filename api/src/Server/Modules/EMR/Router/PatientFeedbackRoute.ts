import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientFeedbackService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientFeedback', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientFeedbackService, req);
    service.AddPatientFeedback(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientFeedback', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientFeedbackService, req);
    service.UpdatePatientFeedback(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFeedbackSignPic', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientFeedbackService, req);
    service.GetFeedbackSignPic(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientFeedbackById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientFeedbackService, req);
    service.GetPatientFeedbackById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientFeedbacks', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientFeedbackService, req);
    service.GetPatientFeedbacks(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientFeedback', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientFeedbackService, req);
    service.DeletePatientFeedback(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
