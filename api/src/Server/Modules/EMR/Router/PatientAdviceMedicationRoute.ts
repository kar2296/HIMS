import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientAdviceMedicationService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientAdviceMedication', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAdviceMedicationService, req);
    service.AddPatientAdviceMedication(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientAdviceMedication', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAdviceMedicationService, req);
    service.UpdatePatientAdviceMedication(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientAdviceMedicationById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAdviceMedicationService, req);
    service.GetPatientAdviceMedicationById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientAdviceMedications', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAdviceMedicationService, req);
    service.ManagePatientAdviceMedications(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientAdviceMedications', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAdviceMedicationService, req);
    service.GetPatientAdviceMedications(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientAdviceMedication', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAdviceMedicationService, req);
    service.DeletePatientAdviceMedication(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
