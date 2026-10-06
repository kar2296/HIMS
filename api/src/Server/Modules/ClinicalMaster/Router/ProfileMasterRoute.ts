import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ProfileMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddProfileMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProfileMasterService, req);
    service.AddProfileMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateProfileMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProfileMasterService, req);
    service.UpdateProfileMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProfileMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProfileMasterService, req);
    service.GetProfileMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProfileMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProfileMasterService, req);
    service.GetProfileMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteProfileMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProfileMasterService, req);
    service.DeleteProfileMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
    router.post('/UpdatePrintConfig', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProfileMasterService, req);
    service.UpdatePrintConfig(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
