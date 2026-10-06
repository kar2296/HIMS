import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StaffCreditPaymentDetailsService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddStaffCreditPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StaffCreditPaymentDetailsService, req);
    service.AddStaffCreditPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStaffCreditPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StaffCreditPaymentDetailsService, req);
    service.UpdateStaffCreditPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStaffCreditPaymentDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StaffCreditPaymentDetailsService, req);
    service.GetStaffCreditPaymentDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStaffCreditPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StaffCreditPaymentDetailsService, req);
    service.GetStaffCreditPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStaffCreditPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StaffCreditPaymentDetailsService, req);
    service.DeleteStaffCreditPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
