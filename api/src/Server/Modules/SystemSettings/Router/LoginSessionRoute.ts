import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { LoginSessionService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddLoginSession', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LoginSessionService, req);
    service.AddLoginSession(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/checkExistingLoginSession', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LoginSessionService, req);
    service.checkExistingLoginSession(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/KeepAlive', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LoginSessionService, req);
    service.KeepAlive(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLicenseDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LoginSessionService, req);
    service.GetLicenseDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLoginSessionById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LoginSessionService, req);
    service.GetLoginSessionById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLoginSessions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LoginSessionService, req);
    service.GetLoginSessions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteLoginSession', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LoginSessionService, req);
    service.DeleteLoginSession(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
