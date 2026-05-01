import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientBillPackageSummaryService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientBillPackageSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillPackageSummaryService, req);
    service.AddPatientBillPackageSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientBillPackageSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillPackageSummaryService, req);
    service.UpdatePatientBillPackageSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBillPackageSummaryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillPackageSummaryService, req);
    service.GetPatientBillPackageSummaryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBillPackageSummarys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillPackageSummaryService, req);
    service.GetPatientBillPackageSummarys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientBillPackageSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillPackageSummaryService, req);
    service.DeletePatientBillPackageSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBillPackageSummaryDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillPackageSummaryService, req);
    service.GetPatientBillPackageSummaryDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/PrintPatientBillPackageSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBillPackageSummaryService, req);
    service.PrintPatientBillPackageSummary(req.body)
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
