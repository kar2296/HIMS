import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { UserBillingCountersService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddUserBillingCounters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserBillingCountersService, req);
    service.AddUserBillingCounters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateUserBillingCounters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserBillingCountersService, req);
    service.UpdateUserBillingCounters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUserBillingCountersById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserBillingCountersService, req);
    service.GetUserBillingCountersById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUserBillingCounters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserBillingCountersService, req);
    service.GetUserBillingCounters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUserBillingCounterWithoutDenominations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserBillingCountersService, req);
    service.GetUserBillingCounterWithoutDenominations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBillingCounters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserBillingCountersService, req);
    service.GetBillingCounters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintUpdateUserBillingCounters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserBillingCountersService, req);
    service.PrintUpdateUserBillingCounters(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
export default router;
