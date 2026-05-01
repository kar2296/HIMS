import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { VendorPaymentDetailsService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddVendorPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorPaymentDetailsService, req);
    service.AddVendorPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateVendorPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorPaymentDetailsService, req);
    service.UpdateVendorPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVendorPaymentDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorPaymentDetailsService, req);
    service.GetVendorPaymentDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVendorPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorPaymentDetailsService, req);
    service.GetVendorPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteVendorPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorPaymentDetailsService, req);
    service.DeleteVendorPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
