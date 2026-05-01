import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { IncidentReportingService } from '../Service/Index';
import { unlinkSync } from 'fs';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddIncidentReporting',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(IncidentReportingService, req);
        service.AddIncidentReporting(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateIncidentReporting', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IncidentReportingService, req);
    service.UpdateIncidentReporting(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UploadAttachment',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(IncidentReportingService, req);
        service.UploadAttachment(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetViewAttachment1', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IncidentReportingService, req);
    service.GetViewAttachment1(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetViewAttachment2', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IncidentReportingService, req);
    service.GetViewAttachment2(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIncidentReportingById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IncidentReportingService, req);
    service.GetIncidentReportingById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAttachment1File', (req: Request, res: Response, next: NextFunction): any => {
    res.download(req.body.Data.Attachment1);
});
router.post('/GetAttachment2File', (req: Request, res: Response, next: NextFunction): any => {
    res.download(req.body.Data.Attachment2);
});
router.post('/GetIncidentReportings', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IncidentReportingService, req);
    service.GetIncidentReportings(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintIncidentReporting', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IncidentReportingService, req);
    service.PrintIncidentReporting(req.body)
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
router.post('/DeleteIncidentReporting', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IncidentReportingService, req);
    service.DeleteIncidentReporting(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
