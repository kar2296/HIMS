import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ModuleService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddModule', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModuleService, req);
    service.AddModule(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateModule', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModuleService, req);
    service.UpdateModule(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetModuleById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModuleService, req);
    service.GetModuleById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetModules', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModuleService, req);
    service.GetModules(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteModule', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModuleService, req);
    service.DeleteModule(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
