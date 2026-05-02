import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ContextService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddContext', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ContextService, req);
    service.AddContext(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateContext', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ContextService, req);
    service.UpdateContext(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetContextById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ContextService, req);
    service.GetContextById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetContexts', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ContextService, req);
    service.GetContexts(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteContext', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ContextService, req);
    service.DeleteContext(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
