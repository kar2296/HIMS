import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { VirtualSubCategoryService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddVirtualSubCategory',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadFacilityLogo(req, res, next, { basePath: AppConfig.LogoUploadExternalFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualSubCategoryService, req);
        service.AddVirtualSubCategory(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateVirtualSubCategory',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualSubCategoryService, req);
        service.UpdateVirtualSubCategory(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetVirtualSubCategoryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualSubCategoryService, req);
    service.GetVirtualSubCategoryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVirtualSubCategorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualSubCategoryService, req);
    service.GetVirtualSubCategorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVirtualSubCategoryImage', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualSubCategoryService, req);
    service.GetVirtualSubCategoryImage(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteVirtualSubCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualSubCategoryService, req);
    service.DeleteVirtualSubCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
