import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientRefundDetailsService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientRefundDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientRefundDetailsService, req);
    service.AddPatientRefundDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientRefundDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientRefundDetailsService, req);
    service.UpdatePatientRefundDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientRefundDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientRefundDetailsService, req);
    service.GetPatientRefundDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientRefundDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientRefundDetailsService, req);
    service.GetPatientRefundDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientRefundDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientRefundDetailsService, req);
    service.DeletePatientRefundDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
