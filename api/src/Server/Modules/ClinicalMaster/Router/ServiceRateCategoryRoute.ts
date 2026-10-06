import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ServiceRateCategoryService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddServiceRateCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceRateCategoryService, req);
    service.AddServiceRateCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateServiceRateCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceRateCategoryService, req);
    service.UpdateServiceRateCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceRateCategoryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceRateCategoryService, req);
    service.GetServiceRateCategoryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceRateCategorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceRateCategoryService, req);
    service.GetServiceRateCategorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteServiceRateCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceRateCategoryService, req);
    service.DeleteServiceRateCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddServiceRateCategoryExcel', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceRateCategoryService, req);
    service.AddServiceRateCategoryExcel(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
