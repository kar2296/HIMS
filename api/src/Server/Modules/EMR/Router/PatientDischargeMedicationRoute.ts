import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientDischargeMedicationService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientDischargeMedication', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDischargeMedicationService, req);
    service.AddPatientDischargeMedication(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientDischargeMedication', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDischargeMedicationService, req);
    service.UpdatePatientDischargeMedication(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientDischargeMedication', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDischargeMedicationService, req);
    service.ManagePatientDischargeMedication(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDischargeMedicationById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDischargeMedicationService, req);
    service.GetPatientDischargeMedicationById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDischargeMedications', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDischargeMedicationService, req);
    service.GetPatientDischargeMedications(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientDischargeMedication', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDischargeMedicationService, req);
    service.DeletePatientDischargeMedication(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
