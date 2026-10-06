import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { RolePrivilegeService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddRolePrivilege', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RolePrivilegeService, req);
    service.AddRolePrivilege(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateRolePrivilege', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RolePrivilegeService, req);
    service.UpdateRolePrivilege(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageRolePrivilege', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RolePrivilegeService, req);
    service.ManageRolePrivilege(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRolePrivilegeById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RolePrivilegeService, req);
    service.GetRolePrivilegeById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRolePrivileges', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RolePrivilegeService, req);
    service.GetRolePrivileges(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteRolePrivilege', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RolePrivilegeService, req);
    service.DeleteRolePrivilege(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
