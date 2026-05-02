import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StockConsumptionService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddStockConsumption', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockConsumptionService, req);
    service.AddStockConsumption(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStockConsumption', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockConsumptionService, req);
    service.UpdateStockConsumption(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockConsumptionById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockConsumptionService, req);
    service.GetStockConsumptionById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockConsumptions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockConsumptionService, req);
    service.GetStockConsumptions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStockConsumption', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockConsumptionService, req);
    service.DeleteStockConsumption(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintStockConsumption', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockConsumptionService, req);
    service.PrintStockConsumption(req.body)
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
