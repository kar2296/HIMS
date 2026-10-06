import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientEmarService } from '../Service/Index';
let router: Router = express.Router();

router.post('/AddPatientEmar', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientEmarService, req);
    service.AddPatientEmar(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientEmar', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientEmarService, req);
    service.UpdatePatientEmar(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientEmarById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientEmarService, req);
    service.GetPatientEmarById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientEmars', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientEmarService, req);
    service.GetPatientEmars(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientEmar', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientEmarService, req);
    service.DeletePatientEmar(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
