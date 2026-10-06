import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AppointmentMultiSessionService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddAppointmentMultiSession', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentMultiSessionService, req);
    service.AddAppointmentMultiSession(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAppointmentMultiSession', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentMultiSessionService, req);
    service.UpdateAppointmentMultiSession(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAppointmentMultiSessionById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentMultiSessionService, req);
    service.GetAppointmentMultiSessionById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAppointmentMultiSessions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentMultiSessionService, req);
    service.GetAppointmentMultiSessions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAppointmentMultiSession', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentMultiSessionService, req);
    service.DeleteAppointmentMultiSession(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
