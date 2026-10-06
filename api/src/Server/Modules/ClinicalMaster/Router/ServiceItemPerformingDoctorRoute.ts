import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ServiceItemPerformingDoctorService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddServiceItemPerformingDoctor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemPerformingDoctorService, req);
    service.AddServiceItemPerformingDoctor(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateServiceItemPerformingDoctor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemPerformingDoctorService, req);
    service.UpdateServiceItemPerformingDoctor(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageServiceItemPerformingDoctor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemPerformingDoctorService, req);
    service.ManageServiceItemPerformingDoctor(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceItemPerformingDoctorById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemPerformingDoctorService, req);
    service.GetServiceItemPerformingDoctorById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceItemPerformingDoctors', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemPerformingDoctorService, req);
    service.GetServiceItemPerformingDoctors(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteServiceItemPerformingDoctor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemPerformingDoctorService, req);
    service.DeleteServiceItemPerformingDoctor(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
