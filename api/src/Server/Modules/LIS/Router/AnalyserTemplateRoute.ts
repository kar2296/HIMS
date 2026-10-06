import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AnalyserTemplateService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddAnalyserTemplate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalyserTemplateService, req);
    service.AddAnalyserTemplate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAnalyserTemplate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalyserTemplateService, req);
    service.UpdateAnalyserTemplate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAnalyserTemplateById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalyserTemplateService, req);
    service.GetAnalyserTemplateById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAnalyserTemplates', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalyserTemplateService, req);
    service.GetAnalyserTemplates(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAnalyserTemplate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalyserTemplateService, req);
    service.DeleteAnalyserTemplate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
