import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { VirtualConferenceSessionUserService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddVirtualConferenceSessionUser', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualConferenceSessionUserService, req);
    service.AddVirtualConferenceSessionUser(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateVirtualConferenceSessionUser', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualConferenceSessionUserService, req);
    service.UpdateVirtualConferenceSessionUser(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVirtualConferenceSessionUserById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualConferenceSessionUserService, req);
    service.GetVirtualConferenceSessionUserById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVirtualConferenceSessionUsers', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualConferenceSessionUserService, req);
    service.GetVirtualConferenceSessionUsers(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteVirtualConferenceSessionUser', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualConferenceSessionUserService, req);
    service.DeleteVirtualConferenceSessionUser(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
