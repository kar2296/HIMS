import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientCreditNoteDetailsService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientCreditNoteDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCreditNoteDetailsService, req);
    service.AddPatientCreditNoteDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientCreditNoteDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCreditNoteDetailsService, req);
    service.UpdatePatientCreditNoteDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientCreditNoteDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCreditNoteDetailsService, req);
    service.GetPatientCreditNoteDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientCreditNoteDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCreditNoteDetailsService, req);
    service.GetPatientCreditNoteDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientCreditNoteDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCreditNoteDetailsService, req);
    service.DeletePatientCreditNoteDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
