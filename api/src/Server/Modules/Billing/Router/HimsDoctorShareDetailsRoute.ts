import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DoctorShareDetailsService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddDoctorShareDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorShareDetailsService, req);
    service.AddDoctorShareDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDoctorShareDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorShareDetailsService, req);
    service.UpdateDoctorShareDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDoctorShareDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorShareDetailsService, req);
    service.GetDoctorShareDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDoctorShareDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorShareDetailsService, req);
    service.GetDoctorShareDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
