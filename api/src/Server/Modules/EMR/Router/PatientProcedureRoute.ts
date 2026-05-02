import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientProcedureService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientProcedure', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientProcedureService, req);
    service.AddPatientProcedure(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientProcedure', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientProcedureService, req);
    service.UpdatePatientProcedure(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientProcedureById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientProcedureService, req);
    service.GetPatientProcedureById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientProcedures', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientProcedureService, req);
    service.ManagePatientProcedures(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientProcedures', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientProcedureService, req);
    service.GetPatientProcedures(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientProcedure', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientProcedureService, req);
    service.DeletePatientProcedure(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
