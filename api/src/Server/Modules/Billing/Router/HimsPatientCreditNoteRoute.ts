import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientCreditNoteService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientCreditNote', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCreditNoteService, req);
    service.AddPatientCreditNote(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientCreditNote', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCreditNoteService, req);
    service.UpdatePatientCreditNote(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientCreditNoteById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCreditNoteService, req);
    service.GetPatientCreditNoteById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientCreditNotes', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCreditNoteService, req);
    service.GetPatientCreditNotes(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientCreditNote', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCreditNoteService, req);
    service.DeletePatientCreditNote(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientCreditNote', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCreditNoteService, req);
    service.PrintPatientCreditNote(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
export default router;
