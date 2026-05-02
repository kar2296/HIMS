import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ResourceMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddResourceMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ResourceMasterService, req);
    service.AddResourceMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateResourceMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ResourceMasterService, req);
    service.UpdateResourceMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetResourceMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ResourceMasterService, req);
    service.GetResourceMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetResourceMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ResourceMasterService, req);
    service.GetResourceMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteResourceMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ResourceMasterService, req);
    service.DeleteResourceMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
