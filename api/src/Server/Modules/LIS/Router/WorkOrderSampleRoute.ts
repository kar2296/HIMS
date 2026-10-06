import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { WorkOrderSampleService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddWorkOrderSample', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderSampleService, req);
    service.AddWorkOrderSample(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateWorkOrderSample', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderSampleService, req);
    service.UpdateWorkOrderSample(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetWorkOrderSampleById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderSampleService, req);
    service.GetWorkOrderSampleById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetWorkOrderSamples', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderSampleService, req);
    service.GetWorkOrderSamples(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageWorkOrderSample', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderSampleService, req);
    service.ManageWorkOrderSample(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageWorkOrderSampleByType', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderSampleService, req);
    service.ManageWorkOrderSampleByType(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageWorkOrderReviewSample', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderSampleService, req);
    service.ManageWorkOrderReviewSample(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteWorkOrderSample', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderSampleService, req);
    service.DeleteWorkOrderSample(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
