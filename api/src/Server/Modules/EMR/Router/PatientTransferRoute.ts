import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientTransferService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientTransfer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientTransferService, req);
    service.AddPatientTransfer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientTransfer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientTransferService, req);
    service.UpdatePatientTransfer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientTransferById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientTransferService, req);
    service.GetPatientTransferById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientTransfers', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientTransferService, req);
    service.GetPatientTransfers(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientTransfer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientTransferService, req);
    service.DeletePatientTransfer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
