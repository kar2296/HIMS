import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { CollectionReportService } from '../Service/Index';
//import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddCollectionReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CollectionReportService, req);
    service.AddCollectionReport(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCollectionReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CollectionReportService, req);
    service.UpdateCollectionReport(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageCollectionReportUpdate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CollectionReportService, req);
    service.ManageCollectionReportUpdate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCollectionReportById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CollectionReportService, req);
    service.GetCollectionReportById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCollectionReports', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CollectionReportService, req);
    service.GetCollectionReports(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
// router.post('/DeleteCollectionReport', (req: Request, res: Response, next: NextFunction): any => {
//     const service = ServiceFactory.CreateService(CollectionReportService, req);
//     service.DeleteCollectionReport(req.body)
//         .then((response) => { res.send(response); })
//         .catch(next);
// });

export default router;
