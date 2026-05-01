import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientStockRequestDetailsService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientStockRequestDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockRequestDetailsService, req);
    service.AddPatientStockRequestDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientStockRequestDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockRequestDetailsService, req);
    service.UpdatePatientStockRequestDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientStockRequestDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockRequestDetailsService, req);
    service.GetPatientStockRequestDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientStockRequestDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockRequestDetailsService, req);
    service.GetPatientStockRequestDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientStockRequestDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockRequestDetailsService, req);
    service.DeletePatientStockRequestDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientIndentPendingReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockRequestDetailsService, req);
    service.PrintPatientIndentPendingReport(req.body)
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
