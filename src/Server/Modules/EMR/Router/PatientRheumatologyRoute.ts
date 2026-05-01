import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientRheumatologyService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientRheumatology', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientRheumatologyService, req);
    service.AddPatientRheumatology(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientRheumatology', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientRheumatologyService, req);
    service.UpdatePatientRheumatology(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientRheumatologyById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientRheumatologyService, req);
    service.GetPatientRheumatologyById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientRheumatologys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientRheumatologyService, req);
    service.GetPatientRheumatologys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientRheumatology', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientRheumatologyService, req);
    service.DeletePatientRheumatology(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
