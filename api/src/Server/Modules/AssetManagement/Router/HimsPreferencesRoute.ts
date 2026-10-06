import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { PreferencesService} from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddPreferences',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PreferencesService, req);
        service.AddPreferences(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdatePreferences', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PreferencesService, req);
    service.UpdatePreferences(req.body)
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
router.post('/GetPreferencesById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PreferencesService, req);
    service.GetPreferencesById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPreferencess', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PreferencesService, req);
    service.GetPreferencess(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePreferences', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PreferencesService, req);
    service.DeletePreferences(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
