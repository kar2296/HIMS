import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DoctorShareTdsService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddDoctorShareTds', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorShareTdsService, req);
    service.AddDoctorShareTds(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDoctorShareTds', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorShareTdsService, req);
    service.UpdateDoctorShareTds(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDoctorShareTdsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorShareTdsService, req);
    service.GetDoctorShareTdsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDoctorShareTds', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorShareTdsService, req);
    service.GetDoctorShareTds(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
