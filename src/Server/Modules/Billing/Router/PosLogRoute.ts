import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PosLogService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPosLog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PosLogService, req);
    service.AddPosLog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PushTransaction', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PosLogService, req);
    service.PushTransaction(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/TransactionStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PosLogService, req);
    service.TransactionStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePosLog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PosLogService, req);
    service.UpdatePosLog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPosLogById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PosLogService, req);
    service.GetPosLogById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPosLogs', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PosLogService, req);
    service.GetPosLogs(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePosLog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PosLogService, req);
    service.DeletePosLog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
