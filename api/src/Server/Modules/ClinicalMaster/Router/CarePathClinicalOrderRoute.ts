import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { CarePathClinicalOrderService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddCarePathClinicalOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathClinicalOrderService, req);
    service.AddCarePathClinicalOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCarePathClinicalOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathClinicalOrderService, req);
    service.UpdateCarePathClinicalOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCarePathClinicalOrderById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathClinicalOrderService, req);
    service.GetCarePathClinicalOrderById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCarePathClinicalOrders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathClinicalOrderService, req);
    service.GetCarePathClinicalOrders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteCarePathClinicalOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathClinicalOrderService, req);
    service.DeleteCarePathClinicalOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
