import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { InventoryAttachmentService} from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddInventoryAttachment',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(InventoryAttachmentService, req);
        service.AddInventoryAttachment(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateInventoryAttachment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InventoryAttachmentService, req);
    service.UpdateInventoryAttachment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAttachmentFile', (req: Request, res: Response, next: NextFunction): any => {
    //const service = ServiceFactory.CreateService(InventoryAttachmentService, req);
    res.download(req.body.Data.FilePath);
/*
    service.GetAttachmentFile(req.body, res)
        .then((response) => { res.send(response); })
        .catch(next);
        */
});
router.post('/GetInventoryAttachmentById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InventoryAttachmentService, req);
    service.GetInventoryAttachmentById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetInventoryAttachments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InventoryAttachmentService, req);
    service.GetInventoryAttachments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteInventoryAttachment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InventoryAttachmentService, req);
    service.DeleteInventoryAttachment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
