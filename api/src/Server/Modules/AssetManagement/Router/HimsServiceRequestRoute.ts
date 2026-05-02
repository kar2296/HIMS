import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { ServiceRequestService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();
router.post('/AddServiceRequest',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(ServiceRequestService, req);
        service.AddServiceRequest(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateServiceRequest',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(ServiceRequestService, req);
        service.UpdateServiceRequest(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetServiceRequestFile', (req: Request, res: Response, next: NextFunction): any => {
    //const service = ServiceFactory.CreateService(PatientAttachmentService, req);
    res.download(req.body.Data.FilePath);
    /*
        service.GetAttachmentFile(req.body, res)
            .then((response) => { res.send(response); })
            .catch(next);
            */});
router.post('/GetEndUserSignPic', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceRequestService, req);
    service.GetEndUserSignPic(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceRequestById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceRequestService, req);
    service.GetServiceRequestById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceRequests', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceRequestService, req);
    service.GetServiceRequests(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteServiceRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceRequestService, req);
    service.DeleteServiceRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintServiceRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceRequestService, req);
    service.PrintServiceRequest(req.body)
        .then((response) => {
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
export default router;
