import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { WorkOrderSampleDetailService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddWorkOrderSampleDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderSampleDetailService, req);
    service.AddWorkOrderSampleDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateWorkOrderSampleDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderSampleDetailService, req);
    service.UpdateWorkOrderSampleDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetWorkOrderSampleDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderSampleDetailService, req);
    service.GetWorkOrderSampleDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetWorkOrderSampleDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderSampleDetailService, req);
    service.GetWorkOrderSampleDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteWorkOrderSampleDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderSampleDetailService, req);
    service.DeleteWorkOrderSampleDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
