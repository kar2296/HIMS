import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { VirtualCategoryService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddVirtualCategory',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualCategoryService, req);
        service.AddVirtualCategory(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateVirtualCategory',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualCategoryService, req);
        service.UpdateVirtualCategory(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetVirtualCategoryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualCategoryService, req);
    service.GetVirtualCategoryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVirtualCategorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualCategoryService, req);
    service.GetVirtualCategorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVirtualCategoryImage', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualCategoryService, req);
    service.GetVirtualCategoryImage(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteVirtualCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualCategoryService, req);
    service.DeleteVirtualCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
