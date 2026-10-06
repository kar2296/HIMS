import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StoreUserMapService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddStoreUserMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreUserMapService, req);
    service.AddStoreUserMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStoreUserMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreUserMapService, req);
    service.UpdateStoreUserMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStoreUserMapById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreUserMapService, req);
    service.GetStoreUserMapById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStoreUserMaps', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreUserMapService, req);
    service.GetStoreUserMaps(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStoreUserMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreUserMapService, req);
    service.DeleteStoreUserMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
