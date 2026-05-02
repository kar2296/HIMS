import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { PatientArchiveService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientArchive',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientArchiveService, req);
        service.AddPatientArchive(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdatePatientArchive',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientArchiveService, req);
        service.UpdatePatientArchive(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/RegCumVisitWithBill',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientArchiveService, req);
        service.RegCumVisitWithBill(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });

router.post('/ManageCrossConsultation',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientArchiveService, req);
        service.ManageCrossConsultation(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });

router.post('/RegistrationCumVisit',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientArchiveService, req);
        service.RegistrationCumVisit(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetPatientArchiveProfilePic', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientArchiveService, req);
    service.GetPatientArchiveProfilePic(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientArchiveById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientArchiveService, req);
    service.GetPatientArchiveById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientArchiveInfoById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientArchiveService, req);
    service.GetPatientArchiveInfoById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientArchiveByIdForPharmacy', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientArchiveService, req);
    service.GetPatientArchiveByIdForPharmacy(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientArchiveMinimalInfoById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientArchiveService, req);
    service.GetPatientArchiveMinimalInfoById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientArchives', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientArchiveService, req);
    service.GetPatientArchives(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientArchive', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientArchiveService, req);
    service.DeletePatientArchive(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientArchive', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientArchiveService, req);
    service.PrintPatientArchive(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});

router.post('/PrintPatientArchiveLabel', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientArchiveService, req);
    service.PrintPatientArchiveLabel(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintPatientArchiveCard', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientArchiveService, req);
    service.PrintPatientArchiveCard(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});


export default router;
