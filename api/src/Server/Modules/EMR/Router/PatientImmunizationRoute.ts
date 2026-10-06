import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientImmunizationService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientImmunization', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientImmunizationService, req);
    service.AddPatientImmunization(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientImmunization', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientImmunizationService, req);
    service.UpdatePatientImmunization(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientImmunizationById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientImmunizationService, req);
    service.GetPatientImmunizationById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientImmunizations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientImmunizationService, req);
    service.ManagePatientImmunizations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientImmunizations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientImmunizationService, req);
    service.GetPatientImmunizations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientImmunization', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientImmunizationService, req);
    service.DeletePatientImmunization(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
