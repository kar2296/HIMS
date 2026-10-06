import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientBillSummaryService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientBillSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillSummaryService, req);
    service.AddPatientBillSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientBillSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillSummaryService, req);
    service.UpdatePatientBillSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateBillSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillSummaryService, req);
    service.UpdateBillSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBillSummaryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillSummaryService, req);
    service.GetPatientBillSummaryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBillSummarys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillSummaryService, req);
    service.GetPatientBillSummarys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBillSummaryDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillSummaryService, req);
    service.GetPatientBillSummaryDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientBillSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillSummaryService, req);
    service.DeletePatientBillSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientBillSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillSummaryService, req);
    service.PrintPatientBillSummary(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
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
