import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { GroupService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddGroup', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GroupService, req);
    service.AddGroup(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateGroup', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GroupService, req);
    service.UpdateGroup(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGroupById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GroupService, req);
    service.GetGroupById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGroups', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GroupService, req);
    service.GetGroups(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteGroup', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GroupService, req);
    service.DeleteGroup(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/MapFacilities', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GroupService, req);
    service.MapFacilities(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFacilities', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GroupService, req);
    service.GetFacilities(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/MapRoles', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GroupService, req);
    service.MapRoles(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRoles', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GroupService, req);
    service.GetRoles(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});


export default router;
