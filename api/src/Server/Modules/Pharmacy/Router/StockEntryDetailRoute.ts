import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StockEntryDetailService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddStockEntryDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockEntryDetailService, req);
    service.AddStockEntryDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStockEntryDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockEntryDetailService, req);
    service.UpdateStockEntryDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockEntryDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockEntryDetailService, req);
    service.GetStockEntryDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockEntryDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockEntryDetailService, req);
    service.GetStockEntryDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStockEntryDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockEntryDetailService, req);
    service.DeleteStockEntryDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
