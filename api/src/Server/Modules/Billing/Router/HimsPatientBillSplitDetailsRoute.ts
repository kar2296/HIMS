import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientBillSplitDetailsService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientBillSplitDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillSplitDetailsService, req);
    service.AddPatientBillSplitDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientBillSplitDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillSplitDetailsService, req);
    service.UpdatePatientBillSplitDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBillSplitDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillSplitDetailsService, req);
    service.GetPatientBillSplitDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBillSplitDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillSplitDetailsService, req);
    service.GetPatientBillSplitDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientBillSplitDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillSplitDetailsService, req);
    service.DeletePatientBillSplitDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
