import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { AssetDocumentService} from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddAssetDocument',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(AssetDocumentService, req);
        service.AddAssetDocument(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateAssetDocument', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetDocumentService, req);
    service.UpdateAssetDocument(req.body)
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
router.post('/GetAssetDocumentById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetDocumentService, req);
    service.GetAssetDocumentById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAssetDocuments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetDocumentService, req);
    service.GetAssetDocuments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAssetDocument', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetDocumentService, req);
    service.DeleteAssetDocument(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
