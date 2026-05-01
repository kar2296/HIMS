import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { SystemMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddSystemMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SystemMasterService, req);
    service.AddSystemMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateSystemMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SystemMasterService, req);
    service.UpdateSystemMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSystemMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SystemMasterService, req);
    service.GetSystemMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSystemMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SystemMasterService, req);
    service.GetSystemMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteSystemMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SystemMasterService, req);
    service.DeleteSystemMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
