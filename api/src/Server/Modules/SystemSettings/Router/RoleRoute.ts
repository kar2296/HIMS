import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { RoleService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddRole', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RoleService, req);
    service.AddRole(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateRole', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RoleService, req);
    service.UpdateRole(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRoleById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RoleService, req);
    service.GetRoleById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRoles', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RoleService, req);
    service.GetRoles(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteRole', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RoleService, req);
    service.DeleteRole(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/MapFacilities', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RoleService, req);
    service.MapFacilities(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFacilities', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RoleService, req);
    service.GetFacilities(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/MapMobileConfigs', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RoleService, req);
    service.MapMobileConfigs(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRoleMobileConfigMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RoleService, req);
    service.GetRoleMobileConfigMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/MapControls', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RoleService, req);
    service.MapControls(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/MapControls', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RoleService, req);
    service.MapControls(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetControls', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RoleService, req);
    service.GetControls(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
