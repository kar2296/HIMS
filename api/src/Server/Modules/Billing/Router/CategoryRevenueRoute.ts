import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { CategoryRevenueService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddCategoryRevenue', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategoryRevenueService, req);
    service.AddCategoryRevenue(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCategoryRevenue', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategoryRevenueService, req);
    service.UpdateCategoryRevenue(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCategoryRevenueById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategoryRevenueService, req);
    service.GetCategoryRevenueById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCategoryRevenues', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategoryRevenueService, req);
    service.GetCategoryRevenues(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteCategoryRevenue', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategoryRevenueService, req);
    service.DeleteCategoryRevenue(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
