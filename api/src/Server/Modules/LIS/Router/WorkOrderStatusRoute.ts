import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { WorkOrderStatusService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddWorkOrderStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderStatusService, req);
    service.AddWorkOrderStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateWorkOrderStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderStatusService, req);
    service.UpdateWorkOrderStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetWorkOrderStatusById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderStatusService, req);
    service.GetWorkOrderStatusById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetWorkOrderStatuss', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderStatusService, req);
    service.GetWorkOrderStatuss(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteWorkOrderStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderStatusService, req);
    service.DeleteWorkOrderStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
