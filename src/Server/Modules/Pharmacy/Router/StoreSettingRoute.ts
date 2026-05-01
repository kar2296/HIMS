import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StoreSettingService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddStoreSetting', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreSettingService, req);
    service.AddStoreSetting(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStoreSetting', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreSettingService, req);
    service.UpdateStoreSetting(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStoreSettingById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreSettingService, req);
    service.GetStoreSettingById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStoreSettings', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreSettingService, req);
    service.GetStoreSettings(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStoreSetting', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreSettingService, req);
    service.DeleteStoreSetting(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
