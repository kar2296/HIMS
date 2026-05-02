import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { TaskManagementService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddTaskManagement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TaskManagementService, req);
    service.AddTaskManagement(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateTaskManagement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TaskManagementService, req);
    service.UpdateTaskManagement(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTaskManagementById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TaskManagementService, req);
    service.GetTaskManagementById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMaxId', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TaskManagementService, req);
    service.GetMaxId(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTaskManagements', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TaskManagementService, req);
    service.GetTaskManagements(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteTaskManagement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TaskManagementService, req);
    service.DeleteTaskManagement(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
