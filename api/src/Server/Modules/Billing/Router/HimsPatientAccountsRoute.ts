import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientAccountsService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientAccounts', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAccountsService, req);
    service.AddPatientAccounts(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientAccounts', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAccountsService, req);
    service.UpdatePatientAccounts(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientAccountsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAccountsService, req);
    service.GetPatientAccountsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientAccounts', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAccountsService, req);
    service.GetPatientAccounts(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientAccounts', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAccountsService, req);
    service.DeletePatientAccounts(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
