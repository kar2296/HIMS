import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { LinenStockItemsService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddLinenStockItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenStockItemsService, req);
    service.AddLinenStockItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateLinenStockItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenStockItemsService, req);
    service.UpdateLinenStockItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLinenStockItemsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenStockItemsService, req);
    service.GetLinenStockItemsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLinenStockItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenStockItemsService, req);
    service.GetLinenStockItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteLinenStockItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenStockItemsService, req);
    service.DeleteLinenStockItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
