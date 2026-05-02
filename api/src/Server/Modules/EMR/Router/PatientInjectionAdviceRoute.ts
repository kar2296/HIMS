import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientInjectionAdviceService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientInjectionAdvice', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientInjectionAdviceService, req);
    service.AddPatientInjectionAdvice(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientInjectionAdvice', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientInjectionAdviceService, req);
    service.UpdatePatientInjectionAdvice(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientInjectionAdvices', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientInjectionAdviceService, req);
    service.ManagePatientInjectionAdvices(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientInjectionAdviceById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientInjectionAdviceService, req);
    service.GetPatientInjectionAdviceById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientInjectionAdvices', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientInjectionAdviceService, req);
    service.GetPatientInjectionAdvices(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientInjectionAdvice', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientInjectionAdviceService, req);
    service.DeletePatientInjectionAdvice(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
