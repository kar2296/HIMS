import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ProfileSectionService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddProfileSection', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProfileSectionService, req);
    service.AddProfileSection(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateProfileSection', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProfileSectionService, req);
    service.UpdateProfileSection(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageProfileSection', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProfileSectionService, req);
    service.ManageProfileSection(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProfileSectionById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProfileSectionService, req);
    service.GetProfileSectionById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProfileSections', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProfileSectionService, req);
    service.GetProfileSections(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteProfileSection', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProfileSectionService, req);
    service.DeleteProfileSection(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
