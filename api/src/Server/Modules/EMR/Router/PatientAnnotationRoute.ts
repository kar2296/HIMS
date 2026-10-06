import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { PatientAnnotationService} from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddPatientAnnotation',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientAnnotationService, req);
        service.AddPatientAnnotation(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdatePatientAnnotation',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientAnnotationService, req);
        service.UpdatePatientAnnotation(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetAnnotationFile', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAnnotationService, req);
    service.GetAnnotationFile(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientAnnotationById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAnnotationService, req);
    service.GetPatientAnnotationById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientAnnotations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAnnotationService, req);
    service.GetPatientAnnotations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientAnnotation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientAnnotationService, req);
    service.DeletePatientAnnotation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
