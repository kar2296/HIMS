import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { EventDashboardService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddEventDashboard', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EventDashboardService, req);
    service.AddEventDashboard(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateEventDashboard', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EventDashboardService, req);
    service.UpdateEventDashboard(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEventDashboardById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EventDashboardService, req);
    service.GetEventDashboardById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEventDashboards', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EventDashboardService, req);
    service.GetEventDashboards(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteEventDashboard', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EventDashboardService, req);
    service.DeleteEventDashboard(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
