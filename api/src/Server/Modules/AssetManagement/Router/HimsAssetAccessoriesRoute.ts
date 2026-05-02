import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AssetAccessoriesService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddAssetAccessories', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetAccessoriesService, req);
    service.AddAssetAccessories(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAssetAccessories', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetAccessoriesService, req);
    service.UpdateAssetAccessories(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageAssetAccessoriess', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetAccessoriesService, req);
    service.ManageAssetAccessoriess(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAssetAccessoriesById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetAccessoriesService, req);
    service.GetAssetAccessoriesById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAssetAccessoriess', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetAccessoriesService, req);
    service.GetAssetAccessoriess(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAssetAccessories', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetAccessoriesService, req);
    service.DeleteAssetAccessories(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintAssetAccessoriesReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetAccessoriesService, req);
    service.PrintAssetAccessoriesReport(req.body)
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
export default router;
