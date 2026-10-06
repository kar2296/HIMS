import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StockConsumptionDetailService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddStockConsumptionDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockConsumptionDetailService, req);
    service.AddStockConsumptionDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStockConsumptionDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockConsumptionDetailService, req);
    service.UpdateStockConsumptionDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockConsumptionDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockConsumptionDetailService, req);
    service.GetStockConsumptionDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockConsumptionDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockConsumptionDetailService, req);
    service.GetStockConsumptionDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStockConsumptionDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockConsumptionDetailService, req);
    service.DeleteStockConsumptionDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintStockConsumptionReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockConsumptionDetailService, req);
    service.PrintStockConsumptionReport(req.body)
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
