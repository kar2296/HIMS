import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { PatientIdentityService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddPatientIdentity',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientIdentityService, req);
    service.AddPatientIdentity(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientIdentity',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientIdentityService, req);
    service.UpdatePatientIdentity(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientIdentities',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientIdentityService, req);
    service.ManagePatientIdentities(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientIdDocs', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientIdentityService, req);
    service.GetPatientIdDocs(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientIdentityById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientIdentityService, req);
    service.GetPatientIdentityById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientIdentitys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientIdentityService, req);
    service.GetPatientIdentitys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientIdentity', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientIdentityService, req);
    service.DeletePatientIdentity(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
