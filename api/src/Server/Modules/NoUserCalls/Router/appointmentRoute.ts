import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AppointmentService, AppointmentRequestService, AppointmentMultiSessionService } from '../../Appointment/Service/Index';

let router: Router = express.Router();

router.post('/GetAppointments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentService, req);
    service.GetAppointments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

// router.post('/GetAppointmentsv2', (req: Request, res: Response, next: NextFunction): any => {
//     const service = ServiceFactory.CreateService(AppointmentService, req);
//     service.GetAppointmentsV2(req.body)
//         .then((response) => { res.send(response); })
//         .catch(next);
// });

router.post('/GetAppointmentRequests', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentRequestService, req);
    service.GetAppointmentRequests(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/GetAppointmentMultiSessions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentMultiSessionService, req);
    service.GetAppointmentMultiSessions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
