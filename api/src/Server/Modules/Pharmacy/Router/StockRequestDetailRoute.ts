import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StockRequestDetailService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddStockRequestDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockRequestDetailService, req);
    service.AddStockRequestDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStockRequestDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockRequestDetailService, req);
    service.UpdateStockRequestDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockRequestDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockRequestDetailService, req);
    service.GetStockRequestDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockRequestDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockRequestDetailService, req);
    service.GetStockRequestDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStockRequestDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockRequestDetailService, req);
    service.DeleteStockRequestDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
