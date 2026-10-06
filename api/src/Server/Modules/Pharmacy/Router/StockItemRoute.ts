import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StockItemService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddStockItem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockItemService, req);
    service.AddStockItem(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStockItem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockItemService, req);
    service.UpdateStockItem(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockItemById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockItemService, req);
    service.GetStockItemById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockItemService, req);
    service.GetStockItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockItemsforPR', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockItemService, req);
    service.GetStockItemsforPR(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetToDayStockItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockItemService, req);
    service.GetToDayStockItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockItemsForSale', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockItemService, req);
    service.GetStockItemsForSale(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStockItem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockItemService, req);
    service.DeleteStockItem(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
