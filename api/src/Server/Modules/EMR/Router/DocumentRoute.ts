import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { DocumentService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddDocument',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(DocumentService, req);
        service.AddDocument(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateDocument',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(DocumentService, req);
        service.UpdateDocument(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetDocumentById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DocumentService, req);
    service.GetDocumentById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDocuments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DocumentService, req);
    service.GetDocuments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDocumentFile', (req: Request, res: Response, next: NextFunction): any => {
    res.download(req.body.Data.DocumentPath);
});
router.post('/DeleteDocument', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DocumentService, req);
    service.DeleteDocument(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
