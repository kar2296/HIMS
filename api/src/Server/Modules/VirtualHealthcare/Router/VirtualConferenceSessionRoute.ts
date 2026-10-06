import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { VirtualConferenceSessionService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddVirtualConferenceSession', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualConferenceSessionService, req);
    service.AddVirtualConferenceSession(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateVirtualConferenceSession', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualConferenceSessionService, req);
    service.UpdateVirtualConferenceSession(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVirtualConferenceSessionById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualConferenceSessionService, req);
    service.GetVirtualConferenceSessionById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVirtualConferenceSessions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualConferenceSessionService, req);
    service.GetVirtualConferenceSessions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteVirtualConferenceSession', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualConferenceSessionService, req);
    service.DeleteVirtualConferenceSession(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
