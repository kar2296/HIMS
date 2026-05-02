import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StockSerialMovementService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddStockSerialMovement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialMovementService, req);
    service.AddStockSerialMovement(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStockSerialMovement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialMovementService, req);
    service.UpdateStockSerialMovement(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockSerialMovementById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialMovementService, req);
    service.GetStockSerialMovementById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockSerialMovements', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialMovementService, req);
    service.GetStockSerialMovements(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStockSerialMovement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialMovementService, req);
    service.DeleteStockSerialMovement(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
