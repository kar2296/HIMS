import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StorePreferenceMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddStorePreferenceMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StorePreferenceMasterService, req);
    service.AddStorePreferenceMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStorePreferenceMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StorePreferenceMasterService, req);
    service.UpdateStorePreferenceMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStorePreferenceMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StorePreferenceMasterService, req);
    service.GetStorePreferenceMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStorePreferenceMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StorePreferenceMasterService, req);
    service.GetStorePreferenceMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStorePreferenceMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StorePreferenceMasterService, req);
    service.DeleteStorePreferenceMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
