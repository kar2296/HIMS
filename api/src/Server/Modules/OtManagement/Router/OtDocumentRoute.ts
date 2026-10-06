import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { OtDocumentService} from '../Service/Index';
import { AppConfig } from '../../../../config/index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddOtDocument',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(OtDocumentService, req);
        service.AddOtDocument(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateOtDocument', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtDocumentService, req);
    service.UpdateOtDocument(req.body)
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
router.post('/GetOtDocumentById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtDocumentService, req);
    service.GetOtDocumentById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOtDocuments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtDocumentService, req);
    service.GetOtDocuments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/printOtDocuments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtDocumentService, req);
    service.printOtDocuments(req.body)
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
router.post('/DeleteOtDocument', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtDocumentService, req);
    service.DeleteOtDocument(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
