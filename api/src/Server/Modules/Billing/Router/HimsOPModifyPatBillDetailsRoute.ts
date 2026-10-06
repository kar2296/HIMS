import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { OPModifyPatBillDetailsService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OPModifyPatBillDetailsService, req);
    service.AddPatientBillDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBillDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OPModifyPatBillDetailsService, req);
    service.GetPatientBillDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientInsuranceBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OPModifyPatBillDetailsService, req);
    service.GetPatientInsuranceBillDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OPModifyPatBillDetailsService, req);
    service.GetPatientBillDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientPharmacyBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OPModifyPatBillDetailsService, req);
    service.GetPatientPharmacyBillDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientOTPharmacyBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OPModifyPatBillDetailsService, req);
    service.GetPatientOTPharmacyBillDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPreviousOrders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OPModifyPatBillDetailsService, req);
    service.GetPreviousOrders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OPModifyPatBillDetailsService, req);
    service.PrintPatientBillDetails(req.body)
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
