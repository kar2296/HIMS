import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { TreatmentPlanDetailService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddTreatmentPlanDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatmentPlanDetailService, req);
    service.AddTreatmentPlanDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateTreatmentPlanDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatmentPlanDetailService, req);
    service.UpdateTreatmentPlanDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateTreatmentPlanBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatmentPlanDetailService, req);
    service.UpdateTreatmentPlanBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateTreatmentPlanBillDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatmentPlanDetailService, req);
    service.UpdateTreatmentPlanBillDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTreatmentPlanDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatmentPlanDetailService, req);
    service.GetTreatmentPlanDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTreatmentPlanDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatmentPlanDetailService, req);
    service.GetTreatmentPlanDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteTreatmentPlanDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatmentPlanDetailService, req);
    service.DeleteTreatmentPlanDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
