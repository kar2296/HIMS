import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ProcedureOrderService } from '../Service/Index';
//import { unlinkSync } from 'fs';
let router: Router = express.Router();

router.post('/AddProcedureOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureOrderService, req);
    service.AddProcedureOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateProcedureOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureOrderService, req);
    service.UpdateProcedureOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageProcedureOrders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureOrderService, req);
    service.ManageProcedureOrders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/UpdateProcedureOrderReview', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureOrderService, req);
    service.UpdateProcedureOrderReview(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProcedureOrderById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureOrderService, req);
    service.GetProcedureOrderById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProcedureOrderWithDetailsByBillingId', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureOrderService, req);
    service.GetProcedureOrderWithDetailsByBillingId(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProcedureOrders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureOrderService, req);
    service.GetProcedureOrders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProcedureOrdersForApproval', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureOrderService, req);
    service.GetProcedureOrdersForApproval(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProcedureOrderDetailsForApproval', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureOrderService, req);
    service.GetProcedureOrderDetailsForApproval(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteProcedureOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureOrderService, req);
    service.DeleteProcedureOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
