import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ConsumablesService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddConsumables', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConsumablesService, req);
    service.AddConsumables(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateConsumables', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConsumablesService, req);
    service.UpdateConsumables(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetConsumablesById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConsumablesService, req);
    service.GetConsumablesById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetConsumabless', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConsumablesService, req);
    service.GetConsumabless(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteConsumables', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConsumablesService, req);
    service.DeleteConsumables(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
