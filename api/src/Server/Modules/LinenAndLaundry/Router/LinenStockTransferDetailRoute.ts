import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { LinenStockTransferDetailService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddLinenStockTransferDetail',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(LinenStockTransferDetailService, req);
        service.AddLinenStockTransferDetail(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateLinenStockTransferDetail',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(LinenStockTransferDetailService, req);
        service.UpdateLinenStockTransferDetail(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetLinenStockTransferDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenStockTransferDetailService, req);
    service.GetLinenStockTransferDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLinenStockTransferDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenStockTransferDetailService, req);
    service.GetLinenStockTransferDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteLinenStockTransferDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenStockTransferDetailService, req);
    service.DeleteLinenStockTransferDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
