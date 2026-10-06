import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction,FileUploader } from '../../../Core/Index';
import { CarePathService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddCarePath', (req: Request, res: Response, next: NextFunction): any => {
    FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
},
    (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathService, req);
    service.AddCarePath(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/UpdateCarePath', (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(CarePathService, req);
        service.UpdateCarePath(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
});

router.post('/GetCarePathById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathService, req);
    service.GetCarePathById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemLogo', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathService, req);
    service.GetItemLogo(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCarePaths', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathService, req);
    service.GetCarePaths(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteCarePath', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathService, req);
    service.DeleteCarePath(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
