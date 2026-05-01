import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ServiceGroupService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddServiceGroup', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceGroupService, req);
    service.AddServiceGroup(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateServiceGroup', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceGroupService, req);
    service.UpdateServiceGroup(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageSerivceGroups', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceGroupService, req);
    service.ManageSerivceGroups(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceGroupById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceGroupService, req);
    service.GetServiceGroupById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceGroups', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceGroupService, req);
    service.GetServiceGroups(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteServiceGroup', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceGroupService, req);
    service.DeleteServiceGroup(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
