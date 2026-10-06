import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ModifiedPatientPaymentDetailsService } from '../Service/Index';
let router: Router = express.Router();

router.post('/AddModifiedPatientPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientPaymentDetailsService, req);
    service.AddModifiedPatientPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateModifiedPatientPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientPaymentDetailsService, req);
    service.UpdateModifiedPatientPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetModifiedPatientPaymentDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientPaymentDetailsService, req);
    service.GetModifiedPatientPaymentDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetModifiedPatientPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientPaymentDetailsService, req);
    service.GetModifiedPatientPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteModifiedPatientPaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientPaymentDetailsService, req);
    service.DeleteModifiedPatientPaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
