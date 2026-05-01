import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientComplaintsService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientComplaints', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientComplaintsService, req);
    service.AddPatientComplaints(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientComplaints', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientComplaintsService, req);
    service.UpdatePatientComplaints(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientComplaintsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientComplaintsService, req);
    service.GetPatientComplaintsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientComplaintss', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientComplaintsService, req);
    service.GetPatientComplaintss(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientComplaints', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientComplaintsService, req);
    service.DeletePatientComplaints(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
