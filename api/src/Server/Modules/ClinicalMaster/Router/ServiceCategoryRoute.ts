import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ServiceCategoryService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddServiceCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceCategoryService, req);
    service.AddServiceCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateServiceCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceCategoryService, req);
    service.UpdateServiceCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageSerivceCategories', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceCategoryService, req);
    service.ManageSerivceCategories(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageSerivceSubCategories', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceCategoryService, req);
    service.ManageSerivceSubCategories(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceCategoryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceCategoryService, req);
    service.GetServiceCategoryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceCategorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceCategoryService, req);
    service.GetServiceCategorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceSubCategorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceCategoryService, req);
    service.GetServiceSubCategorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteServiceCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceCategoryService, req);
    service.DeleteServiceCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintServiceCategorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceCategoryService, req);
    service.PrintServiceCategorys(req.body)
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
// router.post('/PrintServiceCategorys', (req: Request, res: Response, next: NextFunction): any => {
//     const service = ServiceFactory.CreateService(ServiceCategoryService, req);
//     service.PrintServiceCategorys(req.body)
//         .then((response) => { res.send(response); })
//         .catch(next);
// });

export default router;
