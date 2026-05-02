import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { GuarantorCustomerCardDeductableService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddGuarantorCustomerCardDeductable', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorCustomerCardDeductableService, req);
    service.AddGuarantorCustomerCardDeductable(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateGuarantorCustomerCardDeductable', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorCustomerCardDeductableService, req);
    service.UpdateGuarantorCustomerCardDeductable(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGuarantorCustomerCardDeductableById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorCustomerCardDeductableService, req);
    service.GetGuarantorCustomerCardDeductableById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGuarantorCustomerCardDeductables', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorCustomerCardDeductableService, req);
    service.GetGuarantorCustomerCardDeductables(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteGuarantorCustomerCardDeductable', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorCustomerCardDeductableService, req);
    service.DeleteGuarantorCustomerCardDeductable(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
