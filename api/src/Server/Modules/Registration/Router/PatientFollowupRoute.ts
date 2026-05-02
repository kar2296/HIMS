import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientFollowupService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientFollowup', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientFollowupService, req);
    service.AddPatientFollowup(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientFollowup', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientFollowupService, req);
    service.UpdatePatientFollowup(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientFollowups', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientFollowupService, req);
    service.ManagePatientFollowups(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientFollowupById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientFollowupService, req);
    service.GetPatientFollowupById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientFollowups', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientFollowupService, req);
    service.GetPatientFollowups(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientFollowup', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientFollowupService, req);
    service.DeletePatientFollowup(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
