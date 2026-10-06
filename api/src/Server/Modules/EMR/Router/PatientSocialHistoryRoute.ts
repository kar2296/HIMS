import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientSocialHistoryService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientSocialHistory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSocialHistoryService, req);
    service.AddPatientSocialHistory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientSocialHistory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSocialHistoryService, req);
    service.UpdatePatientSocialHistory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientSocialHistoryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSocialHistoryService, req);
    service.GetPatientSocialHistoryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientSocialHistorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSocialHistoryService, req);
    service.ManagePatientSocialHistorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientSocialHistorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSocialHistoryService, req);
    service.GetPatientSocialHistorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientSocialHistory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientSocialHistoryService, req);
    service.DeletePatientSocialHistory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
