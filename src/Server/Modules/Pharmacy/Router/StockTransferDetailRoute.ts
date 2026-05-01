import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StockTransferDetailService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddStockTransferDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockTransferDetailService, req);
    service.AddStockTransferDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStockTransferDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockTransferDetailService, req);
    service.UpdateStockTransferDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockTransferDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockTransferDetailService, req);
    service.GetStockTransferDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockTransferDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockTransferDetailService, req);
    service.GetStockTransferDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStockTransferDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockTransferDetailService, req);
    service.DeleteStockTransferDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintStockIssueVocherReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockTransferDetailService, req);
    service.PrintStockIssueVocherReport(req.body)
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
router.post('/PrintStockTransistReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockTransferDetailService, req);
    service.PrintStockTransistReport(req.body)
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
