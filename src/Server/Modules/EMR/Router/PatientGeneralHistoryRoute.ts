import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientGeneralHistoryService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientGeneralHistory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientGeneralHistoryService, req);
    service.AddPatientGeneralHistory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientGeneralHistory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientGeneralHistoryService, req);
    service.UpdatePatientGeneralHistory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientGeneralHistoryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientGeneralHistoryService, req);
    service.GetPatientGeneralHistoryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientGeneralHistorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientGeneralHistoryService, req);
    service.GetPatientGeneralHistorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientGeneralHistory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientGeneralHistoryService, req);
    service.DeletePatientGeneralHistory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
