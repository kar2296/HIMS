import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { LinenStockEntryDetailService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddLinenStockEntryDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenStockEntryDetailService, req);
    service.AddLinenStockEntryDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateLinenStockEntryDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenStockEntryDetailService, req);
    service.UpdateLinenStockEntryDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLinenStockEntryDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenStockEntryDetailService, req);
    service.GetLinenStockEntryDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLinenStockEntryDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenStockEntryDetailService, req);
    service.GetLinenStockEntryDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteLinenStockEntryDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenStockEntryDetailService, req);
    service.DeleteLinenStockEntryDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
