import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { OrganizationService} from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddOrganization',
(req: Request, res: Response, next: NextFunction): any => {
    FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
},
(req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrganizationService, req);
    service.AddOrganization(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateOrganization',
(req: Request, res: Response, next: NextFunction): any => {
    FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
},
(req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrganizationService, req);
    service.UpdateOrganization(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOrganizationLogo', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrganizationService, req);
    service.GetOrganizationLogo(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOrganizationById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrganizationService, req);
    service.GetOrganizationById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOrganizations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrganizationService, req);
    service.GetOrganizations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteOrganization', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrganizationService, req);
    service.DeleteOrganization(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
