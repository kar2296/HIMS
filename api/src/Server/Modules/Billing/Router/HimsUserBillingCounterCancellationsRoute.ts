import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { UserBillingCounterCancellationsService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddUserBillingCounterCancellations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserBillingCounterCancellationsService, req);
    service.AddUserBillingCounterCancellations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateUserBillingCounterCancellations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserBillingCounterCancellationsService, req);
    service.UpdateUserBillingCounterCancellations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUserBillingCounterCancellationsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserBillingCounterCancellationsService, req);
    service.GetUserBillingCounterCancellationsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUserBillingCounterCancellations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserBillingCounterCancellationsService, req);
    service.GetUserBillingCounterCancellations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteUserBillingCounterCancellations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserBillingCounterCancellationsService, req);
    service.DeleteUserBillingCounterCancellations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
