import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ServiceCategoryPriorityService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddServiceCategoryPriority', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceCategoryPriorityService, req);
    service.AddServiceCategoryPriority(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateServiceCategoryPriority', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceCategoryPriorityService, req);
    service.UpdateServiceCategoryPriority(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceCategoryPriorityById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceCategoryPriorityService, req);
    service.GetServiceCategoryPriorityById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceCategoryPrioritys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceCategoryPriorityService, req);
    service.GetServiceCategoryPrioritys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteServiceCategoryPriority', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceCategoryPriorityService, req);
    service.DeleteServiceCategoryPriority(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
