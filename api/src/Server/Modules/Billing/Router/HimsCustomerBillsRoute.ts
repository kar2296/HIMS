import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { CustomerBillsService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddCustomerBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CustomerBillsService, req);
    service.AddCustomerBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCustomerBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CustomerBillsService, req);
    service.UpdateCustomerBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCustomerBillsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CustomerBillsService, req);
    service.GetCustomerBillsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCustomerBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CustomerBillsService, req);
    service.GetCustomerBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintCustomerBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CustomerBillsService, req);
    service.PrintCustomerBills(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
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
