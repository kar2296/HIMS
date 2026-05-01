import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { VirtualConferenceParticipantService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddVirtualConferenceParticipant', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualConferenceParticipantService, req);
    service.AddVirtualConferenceParticipant(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateVirtualConferenceParticipant', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualConferenceParticipantService, req);
    service.UpdateVirtualConferenceParticipant(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVirtualConferenceParticipantById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualConferenceParticipantService, req);
    service.GetVirtualConferenceParticipantById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVirtualConferenceParticipants', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualConferenceParticipantService, req);
    service.GetVirtualConferenceParticipants(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteVirtualConferenceParticipant', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualConferenceParticipantService, req);
    service.DeleteVirtualConferenceParticipant(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
