import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientAlertReviewService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientAlertReview', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAlertReviewService, req);
    service.AddPatientAlertReview(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientAlertReview', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAlertReviewService, req);
    service.UpdatePatientAlertReview(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientAlertReviews', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAlertReviewService, req);
    service.ManagePatientAlertReviews(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientAlertReviewById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAlertReviewService, req);
    service.GetPatientAlertReviewById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientAlertReview', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAlertReviewService, req);
    service.DeletePatientAlertReview(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
