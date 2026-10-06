import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { BillingRequestService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddBillingRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BillingRequestService, req);
    service.AddBillingRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateBillingRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BillingRequestService, req);
    service.UpdateBillingRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBillingRequestById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BillingRequestService, req);
    service.GetBillingRequestById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBillingRequests', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BillingRequestService, req);
    service.GetBillingRequests(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBillingRequestsbygroup', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BillingRequestService, req);
    service.GetBillingRequestsbygroup(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteBillingRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BillingRequestService, req);
    service.DeleteBillingRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRevenueDepartmentSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BillingRequestService, req);
    service.GetRevenueDepartmentSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRevenueCategorySummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BillingRequestService, req);
    service.GetRevenueCategorySummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRevenueDoctorSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BillingRequestService, req);
    service.GetRevenueDoctorSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintDocShareItemCollectionSummaryOPReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BillingRequestService, req);
    service.PrintDocShareItemCollectionSummaryOPReport(req.body)
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
router.post('/PrintDocShareItemCollectionSummaryIPReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BillingRequestService, req);
    service.PrintDocShareItemCollectionSummaryIPReport(req.body)
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
router.post('/PrintRevenueSummaryDepartmentReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BillingRequestService, req);
    service.PrintRevenueSummaryDepartmentReport(req.body)
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

router.post('/PrintRevenueSummaryDoctorReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BillingRequestService, req);
    service.PrintRevenueSummaryDoctorReport(req.body)
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
router.post('/PrintRevenueSummaryCategoryReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BillingRequestService, req);
    service.PrintRevenueSummaryCategoryReport(req.body)
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
