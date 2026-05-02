import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientGuarantorGLService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientGuarantorGL', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientGuarantorGLService, req);
    service.AddPatientGuarantorGL(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientGuarantorGL', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientGuarantorGLService, req);
    service.UpdatePatientGuarantorGL(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientGuarantorGLById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientGuarantorGLService, req);
    service.GetPatientGuarantorGLById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientGuarantorGLs', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientGuarantorGLService, req);
    service.GetPatientGuarantorGLs(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientGuarantorGL', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientGuarantorGLService, req);
    service.DeletePatientGuarantorGL(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
