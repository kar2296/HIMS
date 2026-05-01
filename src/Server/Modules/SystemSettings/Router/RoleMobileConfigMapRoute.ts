import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { RoleMobileConfigMapService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddRoleMobileConfigMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RoleMobileConfigMapService, req);
    service.AddRoleMobileConfigMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateRoleMobileConfigMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RoleMobileConfigMapService, req);
    service.UpdateRoleMobileConfigMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRoleMobileConfigMapById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RoleMobileConfigMapService, req);
    service.GetRoleMobileConfigMapById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRoleMobileConfigMaps', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RoleMobileConfigMapService, req);
    service.GetRoleMobileConfigMaps(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteRoleMobileConfigMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RoleMobileConfigMapService, req);
    service.DeleteRoleMobileConfigMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
