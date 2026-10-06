import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientTrackerService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientTracker', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientTrackerService, req);
    service.AddPatientTracker(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientTracker', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientTrackerService, req);
    service.UpdatePatientTracker(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientTrackerById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientTrackerService, req);
    service.GetPatientTrackerById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientTrackers', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientTrackerService, req);
    service.GetPatientTrackers(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AttendPatient', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientTrackerService, req);
    service.AttendPatient(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AssignPatient', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientTrackerService, req);
    service.AssignPatient(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/CheckoutPatients', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientTrackerService, req);
    service.CheckoutPatients(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/CheckoutPatient', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientTrackerService, req);
    service.CheckoutPatient(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/CheckoutConsultationPatient', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientTrackerService, req);
    service.CheckoutConsultationPatient(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientTracker', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientTrackerService, req);
    service.DeletePatientTracker(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/SendSMSNotifications', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientTrackerService, req);
    service.SendSMSNotifications(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
