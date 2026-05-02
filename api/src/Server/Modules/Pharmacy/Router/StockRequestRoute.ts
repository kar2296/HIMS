import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StockRequestService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddStockRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockRequestService, req);
    service.AddStockRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddExcelStockRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockRequestService, req);
    service.AddExcelStockRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStockRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockRequestService, req);
    service.UpdateStockRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/CompleteStockRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockRequestService, req);
    service.CompleteStockRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockRequestById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockRequestService, req);
    service.GetStockRequestById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockRequestByIdWithoutDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockRequestService, req);
    service.GetStockRequestByIdWithoutDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockRequests', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockRequestService, req);
    service.GetStockRequests(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStockRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockRequestService, req);
    service.DeleteStockRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintStockRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockRequestService, req);
    service.PrintStockRequest(req.body)
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
router.post('/PrintStockReqBeforeTransfer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockRequestService, req);
    service.PrintStockReqBeforeTransfer(req.body)
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
router.post('/PrintStockIndentReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockRequestService, req);
    service.PrintStockIndentReport(req.body)
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
