import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientExaminationSystemService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientExaminationSystem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientExaminationSystemService, req);
    service.AddPatientExaminationSystem(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientExaminationSystem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientExaminationSystemService, req);
    service.UpdatePatientExaminationSystem(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientExaminationSystems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientExaminationSystemService, req);
    service.ManagePatientExaminationSystems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientExaminationSystemById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientExaminationSystemService, req);
    service.GetPatientExaminationSystemById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientExaminationSystems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientExaminationSystemService, req);
    service.GetPatientExaminationSystems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientExaminationSystem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientExaminationSystemService, req);
    service.DeletePatientExaminationSystem(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
