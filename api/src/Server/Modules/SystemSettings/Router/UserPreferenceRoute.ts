import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { UserPreferenceService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddUserPreference', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserPreferenceService, req);
    service.AddUserPreference(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateUserPreference', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserPreferenceService, req);
    service.UpdateUserPreference(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUserPreferenceById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserPreferenceService, req);
    service.GetUserPreferenceById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUserPreferences', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserPreferenceService, req);
    service.GetUserPreferences(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteUserPreference', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserPreferenceService, req);
    service.DeleteUserPreference(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
