import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientExecutableProcedureService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientExecutableProcedure', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientExecutableProcedureService, req);
    service.AddPatientExecutableProcedure(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientExecutableProcedure', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientExecutableProcedureService, req);
    service.UpdatePatientExecutableProcedure(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientExecutableProcedureById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientExecutableProcedureService, req);
    service.GetPatientExecutableProcedureById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientExecutableProcedures', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientExecutableProcedureService, req);
    service.GetPatientExecutableProcedures(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientExecutableProcedure', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientExecutableProcedureService, req);
    service.DeletePatientExecutableProcedure(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
