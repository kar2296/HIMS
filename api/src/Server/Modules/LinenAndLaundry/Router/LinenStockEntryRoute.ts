import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { LinenStockEntryService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddLinenStockEntry', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenStockEntryService, req);
    service.AddLinenStockEntry(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateLinenStockEntry', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenStockEntryService, req);
    service.UpdateLinenStockEntry(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLinenStockEntryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenStockEntryService, req);
    service.GetLinenStockEntryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLinenStockEntrys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenStockEntryService, req);
    service.GetLinenStockEntrys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteLinenStockEntry', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenStockEntryService, req);
    service.DeleteLinenStockEntry(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
