import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StockAdjustmentDetailService } from '../Service/Index';
import { unlinkSync } from 'fs';


let router: Router = express.Router();

router.post('/AddStockAdjustmentDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockAdjustmentDetailService, req);
    service.AddStockAdjustmentDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStockAdjustmentDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockAdjustmentDetailService, req);
    service.UpdateStockAdjustmentDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockAdjustmentDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockAdjustmentDetailService, req);
    service.GetStockAdjustmentDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockAdjustmentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockAdjustmentDetailService, req);
    service.GetStockAdjustmentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStockAdjustmentDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockAdjustmentDetailService, req);
    service.DeleteStockAdjustmentDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintStockAdjustmentReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockAdjustmentDetailService, req);
    service.PrintStockAdjustmentReport(req.body)
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
