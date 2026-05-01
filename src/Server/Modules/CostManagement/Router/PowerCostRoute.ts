import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PowerCostService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPowerCost', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PowerCostService, req);
    service.AddPowerCost(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePowerCost', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PowerCostService, req);
    service.UpdatePowerCost(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPowerCostById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PowerCostService, req);
    service.GetPowerCostById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPowerCosts', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PowerCostService, req);
    service.GetPowerCosts(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePowerCost', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PowerCostService, req);
    service.DeletePowerCost(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
