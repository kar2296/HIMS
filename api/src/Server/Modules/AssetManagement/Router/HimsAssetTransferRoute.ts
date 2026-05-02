import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AssetTransferService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddAssetTransfer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetTransferService, req);
    service.AddAssetTransfer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAssetTransfer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetTransferService, req);
    service.UpdateAssetTransfer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAssetTransferById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetTransferService, req);
    service.GetAssetTransferById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAssetTransfers', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetTransferService, req);
    service.GetAssetTransfers(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAssetTransfer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetTransferService, req);
    service.DeleteAssetTransfer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintAssetTransferReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetTransferService, req);
    service.PrintAssetTransferReport(req.body)
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
router.post('/PrintAssetMovementReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetTransferService, req);
    service.PrintAssetMovementReport(req.body)
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
