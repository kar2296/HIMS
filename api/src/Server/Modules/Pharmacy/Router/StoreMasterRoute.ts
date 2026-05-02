import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { StoreMasterService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddStoreMaster',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(StoreMasterService, req);
        service.AddStoreMaster(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateStoreMaster',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(StoreMasterService, req);
        service.UpdateStoreMaster(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetStoreMasterLogo', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreMasterService, req);
    service.GetStoreMasterLogo(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStoreMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreMasterService, req);
    service.GetStoreMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStoreMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreMasterService, req);
    service.GetStoreMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStoreMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreMasterService, req);
    service.DeleteStoreMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintStoreMasterReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreMasterService, req);
    service.PrintStoreMasterReport(req.body)
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
