import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StoreRackService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddStoreRack', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreRackService, req);
    service.AddStoreRack(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStoreRack', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreRackService, req);
    service.UpdateStoreRack(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStoreRackById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreRackService, req);
    service.GetStoreRackById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStoreRacks', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreRackService, req);
    service.GetStoreRacks(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStoreRack', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreRackService, req);
    service.DeleteStoreRack(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
