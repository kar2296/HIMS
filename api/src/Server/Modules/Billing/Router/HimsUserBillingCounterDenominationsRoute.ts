import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { UserBillingCounterDenominationsService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddUserBillingCounterDenominations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserBillingCounterDenominationsService, req);
    service.AddUserBillingCounterDenominations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateUserBillingCounterDenominations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserBillingCounterDenominationsService, req);
    service.UpdateUserBillingCounterDenominations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUserBillingCounterDenominationsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserBillingCounterDenominationsService, req);
    service.GetUserBillingCounterDenominationsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUserBillingCounterDenominations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserBillingCounterDenominationsService, req);
    service.GetUserBillingCounterDenominations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteUserBillingCounterDenominations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserBillingCounterDenominationsService, req);
    service.DeleteUserBillingCounterDenominations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
