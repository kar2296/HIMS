import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { AssetDisposeService} from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddAssetDispose',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(AssetDisposeService, req);
        service.AddAssetDispose(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateAssetDispose', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetDisposeService, req);
    service.UpdateAssetDispose(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageAssetDispose', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetDisposeService, req);
    service.ManageAssetDispose(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDocumentFile', (req: Request, res: Response, next: NextFunction): any => {
    //const service = ServiceFactory.CreateService(PatientAttachmentService, req);
    res.download(req.body.Data.FilePath);
/*
    service.GetAttachmentFile(req.body, res)
        .then((response) => { res.send(response); })
        .catch(next);
        */
});
router.post('/GetAssetDisposeById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetDisposeService, req);
    service.GetAssetDisposeById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAssetDisposes', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetDisposeService, req);
    service.GetAssetDisposes(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAssetDispose', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetDisposeService, req);
    service.DeleteAssetDispose(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
