import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { LabourCostService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddLabourCost', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LabourCostService, req);
    service.AddLabourCost(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateLabourCost', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LabourCostService, req);
    service.UpdateLabourCost(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLabourCostById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LabourCostService, req);
    service.GetLabourCostById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLabourCosts', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LabourCostService, req);
    service.GetLabourCosts(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteLabourCost', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LabourCostService, req);
    service.DeleteLabourCost(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
