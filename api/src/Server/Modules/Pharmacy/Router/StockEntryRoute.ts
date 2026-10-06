import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StockEntryService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddStockEntry', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockEntryService, req);
    service.AddStockEntry(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStockEntry', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockEntryService, req);
    service.UpdateStockEntry(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockEntryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockEntryService, req);
    service.GetStockEntryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockEntrys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockEntryService, req);
    service.GetStockEntrys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetToDayStockEntrys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockEntryService, req);
    service.GetToDayStockEntrys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStockEntry', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockEntryService, req);
    service.DeleteStockEntry(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintStockEntry', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockEntryService, req);
    service.PrintStockEntry(req.body)
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
router.post('/PrintOpeningStockReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockEntryService, req);
    service.PrintOpeningStockReport(req.body)
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
