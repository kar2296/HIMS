import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ItemSubCategoryService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddItemSubCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemSubCategoryService, req);
    service.AddItemSubCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateItemSubCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemSubCategoryService, req);
    service.UpdateItemSubCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemSubCategoryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemSubCategoryService, req);
    service.GetItemSubCategoryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemSubCategorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemSubCategoryService, req);
    service.GetItemSubCategorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteItemSubCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemSubCategoryService, req);
    service.DeleteItemSubCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
