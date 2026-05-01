import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { NotionalRentService} from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddNotionalRent',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(NotionalRentService, req);
        service.AddNotionalRent(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateNotionalRent', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(NotionalRentService, req);
    service.UpdateNotionalRent(req.body)
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
router.post('/GetNotionalRentById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(NotionalRentService, req);
    service.GetNotionalRentById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetNotionalRents', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(NotionalRentService, req);
    service.GetNotionalRents(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteNotionalRent', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(NotionalRentService, req);
    service.DeleteNotionalRent(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
