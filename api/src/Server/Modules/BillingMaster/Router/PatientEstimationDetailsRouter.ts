import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientEstimationDetailsService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientEstimationDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientEstimationDetailsService, req);
    service.AddPatientEstimationDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientEstimationDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientEstimationDetailsService, req);
    service.UpdatePatientEstimationDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientEstimationDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientEstimationDetailsService, req);
    service.GetPatientEstimationDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientEstimationDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientEstimationDetailsService, req);
    service.GetPatientEstimationDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientEstimationDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientEstimationDetailsService, req);
    service.DeletePatientEstimationDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
