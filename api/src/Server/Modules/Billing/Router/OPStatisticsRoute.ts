import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { OPStatisticsService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddOPStatistics', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OPStatisticsService, req);
    service.AddOPStatistics(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateOPStatistics', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OPStatisticsService, req);
    service.UpdateOPStatistics(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOPStatisticsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OPStatisticsService, req);
    service.GetOPStatisticsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOPStatisticss', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OPStatisticsService, req);
    service.GetOPStatisticss(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteOPStatistics', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OPStatisticsService, req);
    service.DeleteOPStatistics(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
