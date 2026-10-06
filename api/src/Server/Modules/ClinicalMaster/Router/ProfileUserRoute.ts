import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ProfileUserService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddProfileUser', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProfileUserService, req);
    service.AddProfileUser(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateProfileUser', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProfileUserService, req);
    service.UpdateProfileUser(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProfileUserById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProfileUserService, req);
    service.GetProfileUserById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProfileUsers', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProfileUserService, req);
    service.GetProfileUsers(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteProfileUser', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProfileUserService, req);
    service.DeleteProfileUser(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
