import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DoctorInvoiceDetailsService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddDoctorInvoiceDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorInvoiceDetailsService, req);
    service.AddDoctorInvoiceDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDoctorInvoiceDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorInvoiceDetailsService, req);
    service.UpdateDoctorInvoiceDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDoctorInvoiceDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorInvoiceDetailsService, req);
    service.GetDoctorInvoiceDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDoctorInvoiceDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorInvoiceDetailsService, req);
    service.GetDoctorInvoiceDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteDoctorInvoiceDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorInvoiceDetailsService, req);
    service.DeleteDoctorInvoiceDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
