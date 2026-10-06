import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AnalyzerAnalyteMapService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddAnalyzerAnalyteMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalyzerAnalyteMapService, req);
    service.AddAnalyzerAnalyteMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAnalyzerAnalyteMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalyzerAnalyteMapService, req);
    service.UpdateAnalyzerAnalyteMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAnalyzerAnalyteMapById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalyzerAnalyteMapService, req);
    service.GetAnalyzerAnalyteMapById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAnalyzerAnalyteMaps', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalyzerAnalyteMapService, req);
    service.GetAnalyzerAnalyteMaps(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAnalyzerAnalyteMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalyzerAnalyteMapService, req);
    service.DeleteAnalyzerAnalyteMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
