import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { GuarantorCustomerService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddGuarantorCustomer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorCustomerService, req);
    service.AddGuarantorCustomer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateGuarantorCustomer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorCustomerService, req);
    service.UpdateGuarantorCustomer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGuarantorCustomerById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorCustomerService, req);
    service.GetGuarantorCustomerById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGuarantorCustomers', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorCustomerService, req);
    service.GetGuarantorCustomers(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteGuarantorCustomer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorCustomerService, req);
    service.DeleteGuarantorCustomer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
