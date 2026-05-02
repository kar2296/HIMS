import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DynamicQRLogService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddDynamicQRLog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DynamicQRLogService, req);
    service.AddDynamicQRLog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDynamicQRLog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DynamicQRLogService, req);
    service.UpdateDynamicQRLog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/CheckTransactionStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DynamicQRLogService, req);
    service.CheckTransactionStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GenerateQR', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DynamicQRLogService, req);
    service.GenerateQR(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDynamicQRLogById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DynamicQRLogService, req);
    service.GetDynamicQRLogById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDynamicQRLogs', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DynamicQRLogService, req);
    service.GetDynamicQRLogs(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteDynamicQRLog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DynamicQRLogService, req);
    service.DeleteDynamicQRLog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
