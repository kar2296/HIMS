import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { UserDefaultServiceService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddUserDefaultService', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserDefaultServiceService, req);
    service.AddUserDefaultService(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateUserDefaultService', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserDefaultServiceService, req);
    service.UpdateUserDefaultService(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageUserDefaultService', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserDefaultServiceService, req);
    service.ManageUserDefaultService(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUserDefaultServiceById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserDefaultServiceService, req);
    service.GetUserDefaultServiceById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUserDefaultServices', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserDefaultServiceService, req);
    service.GetUserDefaultServices(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDoctorDefaultServices', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserDefaultServiceService, req);
    service.GetDoctorDefaultServices(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteUserDefaultService', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserDefaultServiceService, req);
    service.DeleteUserDefaultService(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
