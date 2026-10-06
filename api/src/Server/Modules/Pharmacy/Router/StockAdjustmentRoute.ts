import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StockAdjustmentService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddStockAdjustment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockAdjustmentService, req);
    service.AddStockAdjustment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStockAdjustment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockAdjustmentService, req);
    service.UpdateStockAdjustment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockAdjustmentById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockAdjustmentService, req);
    service.GetStockAdjustmentById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockAdjustments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockAdjustmentService, req);
    service.GetStockAdjustments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStockAdjustment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockAdjustmentService, req);
    service.DeleteStockAdjustment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintStockAdjustment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockAdjustmentService, req);
    service.PrintStockAdjustment(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
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
