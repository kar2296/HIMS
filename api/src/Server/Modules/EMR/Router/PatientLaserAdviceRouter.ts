import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientLaserAdviceService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientLaserAdvice', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientLaserAdviceService, req);
    service.AddPatientLaserAdvice(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientLaserAdvice', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientLaserAdviceService, req);
    service.UpdatePatientLaserAdvice(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientLaserAdvices', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientLaserAdviceService, req);
    service.ManagePatientLaserAdvices(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientLaserAdviceById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientLaserAdviceService, req);
    service.GetPatientLaserAdviceById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientLaserAdvices', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientLaserAdviceService, req);
    service.GetPatientLaserAdvices(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientLaserAdvice', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientLaserAdviceService, req);
    service.DeletePatientLaserAdvice(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
