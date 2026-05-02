import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientEmarDetailsService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientEmarDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientEmarDetailsService, req);
    service.AddPatientEmarDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientEmarDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientEmarDetailsService, req);
    service.UpdatePatientEmarDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientEmarDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientEmarDetailsService, req);
    service.GetPatientEmarDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientEmarDetailss', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientEmarDetailsService, req);
    service.GetPatientEmarDetailss(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientEmarDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientEmarDetailsService, req);
    service.DeletePatientEmarDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
