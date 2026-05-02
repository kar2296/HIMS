import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientSurgicalService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientSurgical', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSurgicalService, req);
    service.AddPatientSurgical(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientSurgical', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSurgicalService, req);
    service.UpdatePatientSurgical(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientSurgicalById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSurgicalService, req);
    service.GetPatientSurgicalById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientSurgicals', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSurgicalService, req);
    service.ManagePatientSurgicals(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientSurgicals', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSurgicalService, req);
    service.GetPatientSurgicals(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientSurgical', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSurgicalService, req);
    service.DeletePatientSurgical(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
