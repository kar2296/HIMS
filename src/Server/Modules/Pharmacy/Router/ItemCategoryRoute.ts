import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ItemCategoryService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddItemCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemCategoryService, req);
    service.AddItemCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateItemCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemCategoryService, req);
    service.UpdateItemCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemCategoryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemCategoryService, req);
    service.GetItemCategoryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemCategorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemCategoryService, req);
    service.GetItemCategorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteItemCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemCategoryService, req);
    service.DeleteItemCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
