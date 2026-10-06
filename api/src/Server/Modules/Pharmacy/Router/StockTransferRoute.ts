import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StockTransferService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddStockTransfer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockTransferService, req);
    service.AddStockTransfer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStockTransfer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockTransferService, req);
    service.UpdateStockTransfer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AcceptStockTransfer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockTransferService, req);
    service.AcceptStockTransfer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockTransferById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockTransferService, req);
    service.GetStockTransferById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockTransferByIdWithoutDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockTransferService, req);
    service.GetStockTransferByIdWithoutDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockAcceptByIdWithoutDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockTransferService, req);
    service.GetStockAcceptByIdWithoutDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockTransfers', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockTransferService, req);
    service.GetStockTransfers(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStockTransfer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockTransferService, req);
    service.DeleteStockTransfer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/PrintStockTransfer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockTransferService, req);
    service.PrintStockTransfer(req.body)
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
router.post('/PrintStockAcceptance', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockTransferService, req);
    service.PrintStockAcceptance(req.body)
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


router.post('/DMPrintStockTransfer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockTransferService, req);
    service.DMPrintStockTransfer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
