import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AppointmentSessionService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddAppointmentSession', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentSessionService, req);
    service.AddAppointmentSession(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAppointmentSession', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentSessionService, req);
    service.UpdateAppointmentSession(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAppointmentSessionById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentSessionService, req);
    service.GetAppointmentSessionById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAppointmentSessions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentSessionService, req);
    service.GetAppointmentSessions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAppointmentSession', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentSessionService, req);
    service.DeleteAppointmentSession(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
