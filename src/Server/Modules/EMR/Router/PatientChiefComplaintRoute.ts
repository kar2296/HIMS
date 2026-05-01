import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientChiefComplaintService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientChiefComplaint', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientChiefComplaintService, req);
    service.AddPatientChiefComplaint(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientChiefComplaint', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientChiefComplaintService, req);
    service.UpdatePatientChiefComplaint(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientChiefComplaints', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientChiefComplaintService, req);
    service.ManagePatientChiefComplaints(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientChiefComplaintById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientChiefComplaintService, req);
    service.GetPatientChiefComplaintById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientChiefComplaints', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientChiefComplaintService, req);
    service.GetPatientChiefComplaints(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientChiefComplaint', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientChiefComplaintService, req);
    service.DeletePatientChiefComplaint(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
