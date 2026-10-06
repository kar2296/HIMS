import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AppInfoService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddAppInfo', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppInfoService, req);
    service.AddAppInfo(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAppInfo', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppInfoService, req);
    service.UpdateAppInfo(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAppInfoById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppInfoService, req);
    service.GetAppInfoById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAppInfos', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppInfoService, req);
    service.GetAppInfos(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAppInfo', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppInfoService, req);
    service.DeleteAppInfo(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
