import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { CategoryService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/ImportCategories',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(CategoryService, req);
        service.ImportCategories(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/AddCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategoryService, req);
    service.AddCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategoryService, req);
    service.UpdateCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCategoryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategoryService, req);
    service.GetCategoryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCategoriesByType', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategoryService, req);
    service.GetCategoriesByType(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCategorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategoryService, req);
    service.GetCategorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCategorysWithoutConcept', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategoryService, req);
    service.GetCategorysWithoutConcept(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategoryService, req);
    service.DeleteCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
