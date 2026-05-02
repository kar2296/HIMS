import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientKinService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientKin', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientKinService, req);
    service.AddPatientKin(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientKin', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientKinService, req);
    service.UpdatePatientKin(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientKinById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientKinService, req);
    service.GetPatientKinById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientKins', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientKinService, req);
    service.GetPatientKins(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientKin', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientKinService, req);
    service.DeletePatientKin(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
