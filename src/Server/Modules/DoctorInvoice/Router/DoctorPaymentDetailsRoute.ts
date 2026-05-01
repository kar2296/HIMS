import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DoctorPaymentDetailsService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddDoctorPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorPaymentDetailsService, req);
    service.AddDoctorPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDoctorPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorPaymentDetailsService, req);
    service.UpdateDoctorPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDoctorPaymentDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorPaymentDetailsService, req);
    service.GetDoctorPaymentDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDoctorPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorPaymentDetailsService, req);
    service.GetDoctorPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteDoctorPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorPaymentDetailsService, req);
    service.DeleteDoctorPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
