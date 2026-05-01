import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { ERPIntegrationService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/ERPIntegrationXML',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadExternalFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(ERPIntegrationService, req);
        service.ERPIntegrationXML(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/ERPIntegrationXL',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadExternalFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(ERPIntegrationService, req);
        service.ERPIntegrationXL(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/ERPValidation',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadExternalFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(ERPIntegrationService, req);
        service.ERPValidation(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });

export default router;
