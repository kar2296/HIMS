import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { VirtualConferenceService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddVirtualConference',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualConferenceService, req);
        service.AddVirtualConference(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateVirtualConference',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VirtualConferenceService, req);
        service.UpdateVirtualConference(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetVirtualConferenceById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualConferenceService, req);
    service.GetVirtualConferenceById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVirtualConferences', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualConferenceService, req);
    service.GetVirtualConferences(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteVirtualConference', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualConferenceService, req);
    service.DeleteVirtualConference(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/CreateRoom', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualConferenceService, req);
    service.CreateRoom(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/GetAttendeeJoinUrl', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualConferenceService, req);
    service.GetAttendeeJoinUrl(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/GetModeratorJoinUrl', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualConferenceService, req);
    service.GetModeratorJoinUrl(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
