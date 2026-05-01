import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DoctorShareService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddDoctorShare', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorShareService, req);
    service.AddDoctorShare(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDoctorShare', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorShareService, req);
    service.UpdateDoctorShare(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDoctorShareById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorShareService, req);
    service.GetDoctorShareById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDoctorShare', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorShareService, req);
    service.GetDoctorShare(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
