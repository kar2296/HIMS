import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StaffDiscountService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddStaffDiscount', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StaffDiscountService, req);
    service.AddStaffDiscount(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStaffDiscount', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StaffDiscountService, req);
    service.UpdateStaffDiscount(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStaffDiscountById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StaffDiscountService, req);
    service.GetStaffDiscountById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStaffDiscounts', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StaffDiscountService, req);
    service.GetStaffDiscounts(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStaffDiscount', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StaffDiscountService, req);
    service.DeleteStaffDiscount(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
