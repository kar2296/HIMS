import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PosMomentLogService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPosMomentLog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PosMomentLogService, req);
    service.AddPosMomentLog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/MomentTransactionStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PosMomentLogService, req);
    service.MomentTransactionStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePosMomentLog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PosMomentLogService, req);
    service.UpdatePosMomentLog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPosMomentLogById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PosMomentLogService, req);
    service.GetPosMomentLogById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPosMomentLogs', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PosMomentLogService, req);
    service.GetPosMomentLogs(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePosMomentLog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PosMomentLogService, req);
    service.DeletePosMomentLog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
