import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AssetMaintananceService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddAssetMaintanance', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetMaintananceService, req);
    service.AddAssetMaintanance(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAssetMaintanance', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetMaintananceService, req);
    service.UpdateAssetMaintanance(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageAssetMaintanances', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetMaintananceService, req);
    service.ManageAssetMaintanances(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAssetMaintananceById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetMaintananceService, req);
    service.GetAssetMaintananceById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAssetMaintanances', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetMaintananceService, req);
    service.GetAssetMaintanances(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAssetMaintanance', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetMaintananceService, req);
    service.DeleteAssetMaintanance(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintAssetmaintenanceReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetMaintananceService, req);
    service.PrintAssetmaintenanceReport(req.body)
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
