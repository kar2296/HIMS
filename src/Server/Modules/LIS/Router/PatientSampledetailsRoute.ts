import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientSampledetailsService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientSampledetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSampledetailsService, req);
    service.AddPatientSampledetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientSampledetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSampledetailsService, req);
    service.UpdatePatientSampledetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientSampledetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSampledetailsService, req);
    service.GetPatientSampledetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientSampledetailss', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSampledetailsService, req);
    service.GetPatientSampledetailss(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientSampledetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSampledetailsService, req);
    service.DeletePatientSampledetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
