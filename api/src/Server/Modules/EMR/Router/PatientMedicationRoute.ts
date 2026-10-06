import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientMedicationService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientMedication', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientMedicationService, req);
    service.AddPatientMedication(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientMedication', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientMedicationService, req);
    service.UpdatePatientMedication(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientMedicationById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientMedicationService, req);
    service.GetPatientMedicationById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientMedications', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientMedicationService, req);
    service.GetPatientMedications(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientMedication', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientMedicationService, req);
    service.DeletePatientMedication(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
