import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientDispenseReturnDetailsService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientDispenseReturnDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDispenseReturnDetailsService, req);
    service.AddPatientDispenseReturnDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientDispenseReturnDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDispenseReturnDetailsService, req);
    service.UpdatePatientDispenseReturnDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDispenseReturnDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDispenseReturnDetailsService, req);
    service.GetPatientDispenseReturnDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDispenseReturnDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDispenseReturnDetailsService, req);
    service.GetPatientDispenseReturnDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientDispenseReturnDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDispenseReturnDetailsService, req);
    service.DeletePatientDispenseReturnDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
