import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ProcedureOrderDetailService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddProcedureOrderDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureOrderDetailService, req);
    service.AddProcedureOrderDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateProcedureOrderDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureOrderDetailService, req);
    service.UpdateProcedureOrderDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProcedureOrderDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureOrderDetailService, req);
    service.GetProcedureOrderDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProcedureOrderDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureOrderDetailService, req);
    service.GetProcedureOrderDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteProcedureOrderDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureOrderDetailService, req);
    service.DeleteProcedureOrderDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
