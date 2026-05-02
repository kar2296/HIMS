import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { B2BCustomerMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddB2BCustomerMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(B2BCustomerMasterService, req);
    service.AddB2BCustomerMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateB2BCustomerMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(B2BCustomerMasterService, req);
    service.UpdateB2BCustomerMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetB2BCustomerMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(B2BCustomerMasterService, req);
    service.GetB2BCustomerMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetB2BCustomerMasterss', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(B2BCustomerMasterService, req);
    service.GetB2BCustomerMasterss(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteB2BCustomerMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(B2BCustomerMasterService, req);
    service.DeleteB2BCustomerMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
