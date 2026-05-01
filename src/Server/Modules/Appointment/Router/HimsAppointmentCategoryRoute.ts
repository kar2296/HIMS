import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AppointmentCategoryService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddAppointmentCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentCategoryService, req);
    service.AddAppointmentCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAppointmentCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentCategoryService, req);
    service.UpdateAppointmentCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAppointmentCategoryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentCategoryService, req);
    service.GetAppointmentCategoryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAppointmentCategorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentCategoryService, req);
    service.GetAppointmentCategorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAppointmentCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AppointmentCategoryService, req);
    service.DeleteAppointmentCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
