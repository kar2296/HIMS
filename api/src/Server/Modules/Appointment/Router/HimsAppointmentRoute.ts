import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AppointmentService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddAppointment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentService, req);
    service.AddAppointment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAppointment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentService, req);
    service.UpdateAppointment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAppAppointment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentService, req);
    service.UpdateAppAppointment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddAppointmentFromSession', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentService, req);
    service.AddAppointmentFromSession(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAppointmentById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentService, req);
    service.GetAppointmentById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAppointments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentService, req);
    service.GetAppointments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDashboardAppointments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentService, req);
    service.GetDashboardAppointments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAppointmentswithoutDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentService, req);
    service.GetAppointmentswithoutDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAppointmentWithFileLocation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentService, req);
    service.GetAppointmentWithFileLocation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAppointment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentService, req);
    service.DeleteAppointment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/PrintAppointment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentService, req);
    service.PrintAppointment(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintAppointmentScheduleReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentService, req);
    service.PrintAppointmentScheduleReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintAppointmentCancelledReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentService, req);
    service.PrintAppointmentCancelledReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintAppointmentReScheduleReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentService, req);
    service.PrintAppointmentReScheduleReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintAppointmentPatientfromAppReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentService, req);
    service.PrintAppointmentPatientfromAppReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintVideoConsultationPatientList', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentService, req);
    service.PrintVideoConsultationPatientList(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
export default router;
