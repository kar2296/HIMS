import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientBillLockService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientBillLock', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillLockService, req);
    service.AddPatientBillLock(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientBillLock', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillLockService, req);
    service.UpdatePatientBillLock(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBillLockById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillLockService, req);
    service.GetPatientBillLockById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBillLocks', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillLockService, req);
    service.GetPatientBillLocks(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientBillLock', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillLockService, req);
    service.DeletePatientBillLock(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBillLockByEncounterId', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillLockService, req);
    service.GetPatientBillLockByEncounterId(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
