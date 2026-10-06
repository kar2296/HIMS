import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ItemStoreMapService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddItemStoreMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemStoreMapService, req);
    service.AddItemStoreMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateItemStoreMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemStoreMapService, req);
    service.UpdateItemStoreMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemStoreMapById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemStoreMapService, req);
    service.GetItemStoreMapById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemStoreMaps', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemStoreMapService, req);
    service.GetItemStoreMaps(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemsForStockTransfer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemStoreMapService, req);
    service.GetItemsForStockTransfer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteItemStoreMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemStoreMapService, req);
    service.DeleteItemStoreMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintRackDetailsbyStore', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemStoreMapService, req);
    service.PrintRackDetailsbyStore(req.body)
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
router.post('/PrintItemReorderList', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemStoreMapService, req);
    service.PrintItemReorderList(req.body)
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
router.post('/PrintItemROLSetupReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemStoreMapService, req);
    service.PrintItemROLSetupReport(req.body)
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
