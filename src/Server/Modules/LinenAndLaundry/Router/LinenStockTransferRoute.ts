import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { LinenStockTransferService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddLinenStockTransfer',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(LinenStockTransferService, req);
        service.AddLinenStockTransfer(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateLinenStockTransfer',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(LinenStockTransferService, req);
        service.UpdateLinenStockTransfer(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetLinenStockTransferById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenStockTransferService, req);
    service.GetLinenStockTransferById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLinenStockTransfers', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenStockTransferService, req);
    service.GetLinenStockTransfers(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteLinenStockTransfer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenStockTransferService, req);
    service.DeleteLinenStockTransfer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
