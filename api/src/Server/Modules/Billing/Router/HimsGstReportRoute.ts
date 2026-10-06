import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { GstReportService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddGstReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GstReportService, req);
    service.AddGstReport(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateGstReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GstReportService, req);
    service.UpdateGstReport(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGstReportById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GstReportService, req);
    service.GetGstReportById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGstReports', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GstReportService, req);
    service.GetGstReports(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteGstReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GstReportService, req);
    service.DeleteGstReport(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintConsolidateGSTSummaryforDeepam', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GstReportService, req);
    service.PrintConsolidateGSTSummaryforDeepam(req.body)
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
