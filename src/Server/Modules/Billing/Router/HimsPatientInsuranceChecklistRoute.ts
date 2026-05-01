import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientInsuranceChecklistService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientInsuranceChecklist', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientInsuranceChecklistService, req);
    service.AddPatientInsuranceChecklist(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientInsuranceChecklist', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientInsuranceChecklistService, req);
    service.UpdatePatientInsuranceChecklist(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientInsuranceChecklist', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientInsuranceChecklistService, req);
    service.ManagePatientInsuranceChecklist(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientInsuranceChecklistById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientInsuranceChecklistService, req);
    service.GetPatientInsuranceChecklistById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientInsuranceChecklists', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientInsuranceChecklistService, req);
    service.GetPatientInsuranceChecklists(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientInsuranceChecklist', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientInsuranceChecklistService, req);
    service.DeletePatientInsuranceChecklist(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
