import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientConditionService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientCondition', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientConditionService, req);
    service.AddPatientCondition(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientCondition', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientConditionService, req);
    service.UpdatePatientCondition(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientConditionById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientConditionService, req);
    service.GetPatientConditionById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientConditions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientConditionService, req);
    service.ManagePatientConditions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientConditions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientConditionService, req);
    service.GetPatientConditions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientCondition', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientConditionService, req);
    service.DeletePatientCondition(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
