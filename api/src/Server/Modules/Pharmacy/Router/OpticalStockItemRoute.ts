import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { OpticalStockItemService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddOpticalStockItem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalStockItemService, req);
    service.AddOpticalStockItem(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateOpticalStockItem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalStockItemService, req);
    service.UpdateOpticalStockItem(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOpticalStockItemById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalStockItemService, req);
    service.GetOpticalStockItemById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOpticalStockItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalStockItemService, req);
    service.GetOpticalStockItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOpticalStoreItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalStockItemService, req);
    service.GetOpticalStoreItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteOpticalStockItem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalStockItemService, req);
    service.DeleteOpticalStockItem(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
