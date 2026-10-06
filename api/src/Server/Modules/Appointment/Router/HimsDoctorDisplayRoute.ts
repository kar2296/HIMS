import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DoctorDisplayService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddDoctorDisplay', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorDisplayService, req);
    service.AddDoctorDisplay(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDoctorDisplay', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorDisplayService, req);
    service.UpdateDoctorDisplay(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDoctorDisplayById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorDisplayService, req);
    service.GetDoctorDisplayById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetListofDoctors', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorDisplayService, req);
    service.GetListofDoctors(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDoctorDisplays', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorDisplayService, req);
    service.GetDoctorDisplays(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteDoctorDisplay', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DoctorDisplayService, req);
    service.DeleteDoctorDisplay(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
