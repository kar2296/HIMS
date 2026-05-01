import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { CollectionBaseRevenueService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddCollectionBaseRevenue', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CollectionBaseRevenueService, req);
    service.AddCollectionBaseRevenue(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCollectionBaseRevenue', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CollectionBaseRevenueService, req);
    service.UpdateCollectionBaseRevenue(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCollectionBaseRevenueById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CollectionBaseRevenueService, req);
    service.GetCollectionBaseRevenueById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCollectionBaseRevenues', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CollectionBaseRevenueService, req);
    service.GetCollectionBaseRevenues(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteCollectionBaseRevenue', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CollectionBaseRevenueService, req);
    service.DeleteCollectionBaseRevenue(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRevenueDepartmentSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CollectionBaseRevenueService, req);
    service.GetRevenueDepartmentSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRevenueCategorySummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CollectionBaseRevenueService, req);
    service.GetRevenueCategorySummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRevenueDoctorSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CollectionBaseRevenueService, req);
    service.GetRevenueDoctorSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintDocShareItemCollectionSummaryOPReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CollectionBaseRevenueService, req);
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
    const service = ServiceFactory.CreateService(CollectionBaseRevenueService, req);
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
    const service = ServiceFactory.CreateService(CollectionBaseRevenueService, req);
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
    const service = ServiceFactory.CreateService(CollectionBaseRevenueService, req);
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
    const service = ServiceFactory.CreateService(CollectionBaseRevenueService, req);
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
