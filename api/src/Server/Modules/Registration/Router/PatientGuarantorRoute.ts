import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientGuarantorService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientGuarantor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientGuarantorService, req);
    service.AddPatientGuarantor(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientGuarantor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientGuarantorService, req);
    service.UpdatePatientGuarantor(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientGuarantorById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientGuarantorService, req);
    service.GetPatientGuarantorById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientGuarantors', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientGuarantorService, req);
    service.GetPatientGuarantors(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientGuarantor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientGuarantorService, req);
    service.DeletePatientGuarantor(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
