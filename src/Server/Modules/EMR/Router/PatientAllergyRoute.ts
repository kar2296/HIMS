import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientAllergyService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientAllergy', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAllergyService, req);
    service.AddPatientAllergy(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientAllergy', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAllergyService, req);
    service.UpdatePatientAllergy(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientAllergys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAllergyService, req);
    service.ManagePatientAllergys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientAllergyById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAllergyService, req);
    service.GetPatientAllergyById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientAllergys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAllergyService, req);
    service.GetPatientAllergys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientAllergy', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAllergyService, req);
    service.DeletePatientAllergy(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
