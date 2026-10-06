import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { UserTaxDetailService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddUserTaxDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserTaxDetailService, req);
    service.AddUserTaxDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateUserTaxDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserTaxDetailService, req);
    service.UpdateUserTaxDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUserTaxDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserTaxDetailService, req);
    service.GetUserTaxDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUserTaxDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserTaxDetailService, req);
    service.GetUserTaxDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteUserTaxDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserTaxDetailService, req);
    service.DeleteUserTaxDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
