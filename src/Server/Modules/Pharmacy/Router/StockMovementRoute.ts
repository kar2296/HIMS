import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StockMovementService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddStockMovement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockMovementService, req);
    service.AddStockMovement(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStockMovement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockMovementService, req);
    service.UpdateStockMovement(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockMovementById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockMovementService, req);
    service.GetStockMovementById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockMovements', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockMovementService, req);
    service.GetStockMovements(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockDailyMovements', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockMovementService, req);
    service.GetStockDailyMovements(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStockMovement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockMovementService, req);
    service.DeleteStockMovement(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintStockMovementReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockMovementService, req);
    service.PrintStockMovementReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintDailyStockMovement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockMovementService, req);
    service.PrintDailyStockMovement(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
export default router;
