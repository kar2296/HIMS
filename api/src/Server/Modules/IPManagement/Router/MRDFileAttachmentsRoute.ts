import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { MRDFileAttachmentsService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';
let router: Router = express.Router();

router.post('/AddMRDFileAttachment',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.ExternalMRDUploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(MRDFileAttachmentsService, req);
        service.AddMRDFileAttachment(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });

router.post('/UpdateMRDFileAttachment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MRDFileAttachmentsService, req);
    service.UpdateMRDFileAttachment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMRDFileAttachmentById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MRDFileAttachmentsService, req);
    service.GetMRDFileAttachmentById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMRDFileAttachments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MRDFileAttachmentsService, req);
    service.GetMRDFileAttachments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteMRDFileAttachment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MRDFileAttachmentsService, req);
    service.DeleteMRDFileAttachment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/GetAttachmentFile', (req: Request, res: Response, next: NextFunction): any => {
    if (!req.transaction.finished) {
        req.transaction.commit();
    }
    res.download(req.body.Data.FilePath);
});

export default router;
