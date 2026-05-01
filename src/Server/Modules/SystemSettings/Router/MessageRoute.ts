import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { MessageService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddMessage',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(MessageService, req);
        service.AddMessage(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateMessage',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(MessageService, req);
        service.UpdateMessage(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetAttachmentFile', (req: Request, res: Response, next: NextFunction): any => {
    res.download(req.body.Data.Attachment);
});
router.post('/GetMessageById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MessageService, req);
    service.GetMessageById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMessages', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MessageService, req);
    service.GetMessages(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteMessage', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MessageService, req);
    service.DeleteMessage(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
