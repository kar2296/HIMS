import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PriorityStatusService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPriorityStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PriorityStatusService, req);
    service.AddPriorityStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePriorityStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PriorityStatusService, req);
    service.UpdatePriorityStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPriorityStatusById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PriorityStatusService, req);
    service.GetPriorityStatusById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPriorityStatuss', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PriorityStatusService, req);
    service.GetPriorityStatuss(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePriorityStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PriorityStatusService, req);
    service.DeletePriorityStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
