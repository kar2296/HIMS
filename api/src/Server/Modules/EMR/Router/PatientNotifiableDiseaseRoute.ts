import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientNotifiableDiseaseService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientNotifiableDisease', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientNotifiableDiseaseService, req);
    service.AddPatientNotifiableDisease(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientNotifiableDisease', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientNotifiableDiseaseService, req);
    service.UpdatePatientNotifiableDisease(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientNotifiableDiseaseById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientNotifiableDiseaseService, req);
    service.GetPatientNotifiableDiseaseById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientNotifiableDiseases', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientNotifiableDiseaseService, req);
    service.ManagePatientNotifiableDiseases(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientNotifiableDiseases', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientNotifiableDiseaseService, req);
    service.GetPatientNotifiableDiseases(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientNotifiableDisease', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientNotifiableDiseaseService, req);
    service.DeletePatientNotifiableDisease(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
