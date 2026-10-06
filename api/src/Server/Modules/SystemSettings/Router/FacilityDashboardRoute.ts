import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { FacilityDashboardService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/GetFacilityDashboardOptions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityDashboardService, req);
    service.GetFacilityDashboardOptions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFacilityDashboardsReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityDashboardService, req);
    service.GetFacilityDashboardsReport(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFacilityVirtualDashboards', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityDashboardService, req);
    service.GetFacilityVirtualDashboards(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFacilityCovidBedDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityDashboardService, req);
    service.GetFacilityCovidBedDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/SendFacilityDashboardMail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityDashboardService, req);
    service.SendFacilityDashboardMail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/PrintFacilityDashboard', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityDashboardService, req);
    service.PrintFacilityDashboard(req.body)
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
