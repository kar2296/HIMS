import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { FeedbacksMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddFeedbacksMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FeedbacksMasterService, req);
    service.AddFeedbacksMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateFeedbacksMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FeedbacksMasterService, req);
    service.UpdateFeedbacksMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFeedbacksMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FeedbacksMasterService, req);
    service.GetFeedbacksMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFeedbacksMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FeedbacksMasterService, req);
    service.GetFeedbacksMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteFeedbacksMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FeedbacksMasterService, req);
    service.DeleteFeedbacksMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
