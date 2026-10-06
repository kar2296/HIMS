import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ProfileSectionSettingService } from '../Service/Index';

let router: Router = express.Router();

router.post('/GetProfileSectionSettings', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProfileSectionSettingService, req);
    service.GetProfileSectionSettings(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageProfileSectionSettings', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProfileSectionSettingService, req);
    service.ManageProfileSectionSettings(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
