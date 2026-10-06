import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientDietOrderDetailService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientDietOrderDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietOrderDetailService, req);
    service.AddPatientDietOrderDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientDietOrderDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietOrderDetailService, req);
    service.UpdatePatientDietOrderDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDietOrderDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietOrderDetailService, req);
    service.GetPatientDietOrderDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDietOrderDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietOrderDetailService, req);
    service.GetPatientDietOrderDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientDietOrderDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietOrderDetailService, req);
    service.DeletePatientDietOrderDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintMonthlySalesandRevenueDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietOrderDetailService, req);
    service.PrintMonthlySalesandRevenueDetails(req.body)
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
