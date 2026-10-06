import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ExternalProviderService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddExternalProvider', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ExternalProviderService, req);
    service.AddExternalProvider(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateExternalProvider', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ExternalProviderService, req);
    service.UpdateExternalProvider(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetExternalProviderById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ExternalProviderService, req);
    service.GetExternalProviderById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetExternalProvideres', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ExternalProviderService, req);
    service.GetExternalProvideres(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteExternalProvider', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ExternalProviderService, req);
    service.DeleteExternalProvider(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
