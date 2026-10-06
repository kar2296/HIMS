import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { CustomerBillDetailsService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddCustomerBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CustomerBillDetailsService, req);
    service.AddCustomerBillDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCustomerBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CustomerBillDetailsService, req);
    service.UpdateCustomerBillDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCustomerBillDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CustomerBillDetailsService, req);
    service.GetCustomerBillDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCustomerBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CustomerBillDetailsService, req);
    service.GetCustomerBillDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteCustomerBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CustomerBillDetailsService, req);
    service.DeleteCustomerBillDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
