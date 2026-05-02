import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { WorkOrderObservationService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddWorkOrderObservation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderObservationService, req);
    service.AddWorkOrderObservation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateWorkOrderObservation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderObservationService, req);
    service.UpdateWorkOrderObservation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetWorkOrderObservationById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderObservationService, req);
    service.GetWorkOrderObservationById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetWorkOrderObservations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderObservationService, req);
    service.GetWorkOrderObservations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteWorkOrderObservation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WorkOrderObservationService, req);
    service.DeleteWorkOrderObservation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
