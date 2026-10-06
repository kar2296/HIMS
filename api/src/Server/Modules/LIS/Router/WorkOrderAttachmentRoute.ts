import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { WorkOrderAttachmentService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddWorkOrderAttachment',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(WorkOrderAttachmentService, req);
        service.AddWorkOrderAttachment(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });

router.post('/UpdateWorkOrderAttachment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderAttachmentService, req);
    service.UpdateWorkOrderAttachment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/GetAttachmentFile', (req: Request, res: Response, next: NextFunction): any => {
    if (!req.transaction.finished) {
        req.transaction.commit();
    }
    res.download(req.body.Data.FilePath);
});

router.post('/GetWorkOrderAttachmentById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderAttachmentService, req);
    service.GetWorkOrderAttachmentById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetWorkOrderAttachments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderAttachmentService, req);
    service.GetWorkOrderAttachments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteWorkOrderAttachment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderAttachmentService, req);
    service.DeleteWorkOrderAttachment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
