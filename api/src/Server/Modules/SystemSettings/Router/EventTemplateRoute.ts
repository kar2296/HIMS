import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { EventTemplateService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddEventTemplate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EventTemplateService, req);
    service.AddEventTemplate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateEventTemplate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EventTemplateService, req);
    service.UpdateEventTemplate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEventTemplateById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EventTemplateService, req);
    service.GetEventTemplateById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEventTemplates', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EventTemplateService, req);
    service.GetEventTemplates(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteEventTemplate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EventTemplateService, req);
    service.DeleteEventTemplate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
