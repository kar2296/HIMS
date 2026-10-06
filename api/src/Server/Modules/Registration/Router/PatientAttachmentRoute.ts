import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { PatientAttachmentService} from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddPatientAttachment',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientAttachmentService, req);
        service.AddPatientAttachment(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdatePatientAttachment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAttachmentService, req);
    service.UpdatePatientAttachment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAttachmentFile', (req: Request, res: Response, next: NextFunction): any => {
    //const service = ServiceFactory.CreateService(PatientAttachmentService, req);
    res.download(req.body.Data.FilePath);
/*
    service.GetAttachmentFile(req.body, res)
        .then((response) => { res.send(response); })
        .catch(next);
        */
});
router.post('/GetPatientAttachmentById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAttachmentService, req);
    service.GetPatientAttachmentById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientAttachments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAttachmentService, req);
    service.GetPatientAttachments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientAttachment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAttachmentService, req);
    service.DeletePatientAttachment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
