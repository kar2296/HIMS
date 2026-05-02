import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { IPClearenceService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddIPClearence', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPClearenceService, req);
    service.AddIPClearence(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateIPClearence', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPClearenceService, req);
    service.UpdateIPClearence(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIPClearenceById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPClearenceService, req);
    service.GetIPClearenceById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIPClearences', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPClearenceService, req);
    service.GetIPClearences(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteIPClearence', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPClearenceService, req);
    service.DeleteIPClearence(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
