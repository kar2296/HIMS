import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { EquipmentListService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddAsset',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(EquipmentListService, req);
        service.AddAsset(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateAsset',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(EquipmentListService, req);
        service.UpdateAsset(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetAssetProfilePic', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EquipmentListService, req);
    service.GetAssetProfilePic(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAssetById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EquipmentListService, req);
    service.GetAssetById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAssets', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EquipmentListService, req);
    service.GetAssets(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAsset', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EquipmentListService, req);
    service.DeleteAsset(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
