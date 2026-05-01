import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { DepreciationService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddDepreciation',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(DepreciationService, req);
        service.AddDepreciation(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateDepreciation',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(DepreciationService, req);
        service.UpdateDepreciation(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetDepreciationById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DepreciationService, req);
    service.GetDepreciationById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDepreciations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DepreciationService, req);
    service.GetDepreciations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteDepreciation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DepreciationService, req);
    service.DeleteDepreciation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
