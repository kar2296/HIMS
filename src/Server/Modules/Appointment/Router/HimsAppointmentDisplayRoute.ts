import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AppointmentDisplayService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddAppointmentDisplay', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentDisplayService, req);
    service.AddAppointmentDisplay(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAppointmentDisplay', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentDisplayService, req);
    service.UpdateAppointmentDisplay(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAppointmentDisplayById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentDisplayService, req);
    service.GetAppointmentDisplayById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetListofTokens', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentDisplayService, req);
    service.GetListofTokens(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAppointmentDisplays', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentDisplayService, req);
    service.GetAppointmentDisplays(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAppointmentDisplay', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentDisplayService, req);
    service.DeleteAppointmentDisplay(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
