import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientSurgeryAdviceService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientSurgeryAdvice', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSurgeryAdviceService, req);
    service.AddPatientSurgeryAdvice(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientSurgeryAdvice', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSurgeryAdviceService, req);
    service.UpdatePatientSurgeryAdvice(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientSurgeryAdvices', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSurgeryAdviceService, req);
    service.ManagePatientSurgeryAdvices(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientSurgeryAdviceById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSurgeryAdviceService, req);
    service.GetPatientSurgeryAdviceById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientSurgeryAdvices', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSurgeryAdviceService, req);
    service.GetPatientSurgeryAdvices(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientSurgeryAdvice', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSurgeryAdviceService, req);
    service.DeletePatientSurgeryAdvice(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
