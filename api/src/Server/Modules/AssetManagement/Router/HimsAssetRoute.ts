import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { AssetService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddAsset',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(AssetService, req);
        service.AddAsset(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateAsset',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(AssetService, req);
        service.UpdateAsset(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetAssetProfilePic', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetService, req);
    service.GetAssetProfilePic(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAssetById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetService, req);
    service.GetAssetById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAssets', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetService, req);
    service.GetAssets(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAsset', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetService, req);
    service.DeleteAsset(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
// router.post('/PrintAssetList', (req: Request, res: Response, next: NextFunction): any => {
//     const service = ServiceFactory.CreateService(AssetService, req);
//     service.PrintAssetList(req.body)
//         .then((response) => {
//             res.download(response.filename, (err) => {
//                 if (response) {
//                     unlinkSync(response.filename);
//                 }
//                 if (err) {
//                     return next(err);
//                 }
//             });
//         })
//         .catch(next);
// });
router.post('/PrintAssetDetailReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetService, req);
    service.PrintAssetDetailReport(req.body)
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
router.post('/PrintAssetsummarybyDepartmentReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetService, req);
    service.PrintAssetsummarybyDepartmentReport(req.body)
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
