import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { InsurancePaymentDetailsService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddInsurancePaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InsurancePaymentDetailsService, req);
    service.AddInsurancePaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateInsurancePaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InsurancePaymentDetailsService, req);
    service.UpdateInsurancePaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetInsurancePaymentDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InsurancePaymentDetailsService, req);
    service.GetInsurancePaymentDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetInsuranceDisallowance', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InsurancePaymentDetailsService, req);
    service.GetInsuranceDisallowance(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetInsurancePaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InsurancePaymentDetailsService, req);
    service.GetInsurancePaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteInsurancePaymentDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InsurancePaymentDetailsService, req);
    service.DeleteInsurancePaymentDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintInsurancedetailswithpatient', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InsurancePaymentDetailsService, req);
    service.PrintInsurancedetailswithpatient(req.body)
        .then((response) => {
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
router.post('/PrintInsurancetdsreport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InsurancePaymentDetailsService, req);
    service.PrintInsurancetdsreport(req.body)
        .then((response) => {
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
router.post('/PrintInsurancedisallowancereport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InsurancePaymentDetailsService, req);
    service.PrintInsurancedisallowancereport(req.body)
        .then((response) => {
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
