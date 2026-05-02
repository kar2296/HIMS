import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AppointmentRequestService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddAppointmentRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentRequestService, req);
    service.AddAppointmentRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAppointmentRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentRequestService, req);
    service.UpdateAppointmentRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageAppointmentRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentRequestService, req);
    service.ManageAppointmentRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAppointmentRequestById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentRequestService, req);
    service.GetAppointmentRequestById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAppointmentRequests', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentRequestService, req);
    service.GetAppointmentRequests(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAppointmentRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentRequestService, req);
    service.DeleteAppointmentRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAppointmentRequestStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentRequestService, req);
    service.UpdateAppointmentRequestStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
    router.post('/UpdateAppointmentId', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentRequestService, req);
    service.UpdateAppointmentId(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
