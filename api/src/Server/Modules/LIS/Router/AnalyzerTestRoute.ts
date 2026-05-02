import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AnalyzerTestService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddAnalyzerTest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalyzerTestService, req);
    service.AddAnalyzerTest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAnalyzerTest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalyzerTestService, req);
    service.UpdateAnalyzerTest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAnalyzerTestById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalyzerTestService, req);
    service.GetAnalyzerTestById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAnalyzerTests', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalyzerTestService, req);
    service.GetAnalyzerTests(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAnalyzerTest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalyzerTestService, req);
    service.DeleteAnalyzerTest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
