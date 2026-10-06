import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { PatientService } from '../../Registration/Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddSelfPatient',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientService, req);
        service.AddSelfPatientWithoutSession(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetPatientById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.GetPatientById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
// router.post('/GetPatients', (req: Request, res: Response, next: NextFunction): any => {
//     const service = ServiceFactory.CreateService(PatientService, req);
//     service.GetPatientsWithoutSession(req.body)
//         .then((response) => { res.send(response); })
//         .catch(next);
// });

export default router;
