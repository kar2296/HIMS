import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientDiagnosisService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientDiagnosis', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDiagnosisService, req);
    service.AddPatientDiagnosis(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientDiagnosis', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDiagnosisService, req);
    service.UpdatePatientDiagnosis(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDiagnosisById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDiagnosisService, req);
    service.GetPatientDiagnosisById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientDiagnosiss', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDiagnosisService, req);
    service.ManagePatientDiagnosiss(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDiagnosiss', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDiagnosisService, req);
    service.GetPatientDiagnosiss(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientDiagnosis', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDiagnosisService, req);
    service.DeletePatientDiagnosis(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
