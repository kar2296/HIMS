import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { CategoryTypeMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddCategoryTypeMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategoryTypeMasterService, req);
    service.AddCategoryTypeMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCategoryTypeMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategoryTypeMasterService, req);
    service.UpdateCategoryTypeMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCategoryTypeMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategoryTypeMasterService, req);
    service.GetCategoryTypeMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCategoryTypeMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategoryTypeMasterService, req);
    service.GetCategoryTypeMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteCategoryTypeMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategoryTypeMasterService, req);
    service.DeleteCategoryTypeMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
