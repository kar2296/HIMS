import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientClinicalNotesService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientClinicalNotes', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientClinicalNotesService, req);
    service.AddPatientClinicalNotes(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientClinicalNotes', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientClinicalNotesService, req);
    service.UpdatePatientClinicalNotes(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientClinicalNotesById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientClinicalNotesService, req);
    service.GetPatientClinicalNotesById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientClinicalNotess', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientClinicalNotesService, req);
    service.GetPatientClinicalNotess(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientClinicalNotes', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientClinicalNotesService, req);
    service.DeletePatientClinicalNotes(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/SignPatientClinicalNote', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientClinicalNotesService, req);
    service.SignPatientClinicalNote(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AmendPatientClinicalNote', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientClinicalNotesService, req);
    service.AmendPatientClinicalNote(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
