import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { CustomerMasterService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddCustomerMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CustomerMasterService, req);
    service.AddCustomerMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCustomerMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CustomerMasterService, req);
    service.UpdateCustomerMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCustomerMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CustomerMasterService, req);
    service.GetCustomerMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCustomerMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CustomerMasterService, req);
    service.GetCustomerMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteCustomerMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CustomerMasterService, req);
    service.DeleteCustomerMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddCustomerContact', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CustomerMasterService, req);
    service.AddCustomerContact(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCustomerContact', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CustomerMasterService, req);
    service.UpdateCustomerContact(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCustomerContactById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CustomerMasterService, req);
    service.GetCustomerContactById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCustomerContacts', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CustomerMasterService, req);
    service.GetCustomerContacts(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteCustomerContact', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CustomerMasterService, req);
    service.DeleteCustomerContact(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
