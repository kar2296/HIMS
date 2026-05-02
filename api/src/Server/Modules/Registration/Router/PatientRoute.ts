import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { PatientService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatient',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientService, req);
        service.AddPatient(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/AddSpousePatient',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientService, req);
        service.AddSpousePatient(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdatePatient',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientService, req);
        service.UpdatePatient(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdatePatientFamilyId',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientService, req);
        service.UpdatePatientFamilyId(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/AddSelfPatient',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientService, req);
        service.AddSelfPatient(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/AddDayCarePatient',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientService, req);
        service.AddDayCarePatient(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateDayCarePatient',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientService, req);
        service.UpdateDayCarePatient(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/RegCumVisitWithBill',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientService, req);
        service.RegCumVisitWithBill(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/RegCumVisitWithLIS',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientService, req);
        service.RegCumVisitWithLIS(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/AddPharmacyPatient',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientService, req);
        service.AddPharmacyPatient(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/ManageCrossConsultation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.ManageCrossConsultation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/RegistrationCumVisit',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientService, req);
        service.RegistrationCumVisit(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetPatientProfilePic', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.GetPatientProfilePic(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientmrnbarcode', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.GetPatientmrnbarcode(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.GetPatientById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBannerInfoById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.GetPatientBannerInfoById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientMedicalLeaveForm', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.PrintPatientMedicalLeaveForm(req.body)
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
router.post('/GetPatientInfoById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.GetPatientInfoById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientByIdForPharmacy', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.GetPatientByIdForPharmacy(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientMinimalInfoById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.GetPatientMinimalInfoById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatients', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.GetPatients(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientSearch', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.GetPatientSearch(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMinPatientSearch', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.GetMinPatientSearch(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientsInfoBanner', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.GetPatientsInfoBanner(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatient', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.DeletePatient(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DummyVisitCreation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.DummyVisitCreation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DummyIPVisitCreation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.DummyIPVisitCreation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DummyIPOrderCreation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.DummyIPOrderCreation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatient', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.PrintPatient(req.body)
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
router.post('/regprintform', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.regprintform(req.body)
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
router.post('/PrintPatientWithEncounter', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.PrintPatientWithEncounter(req.body)
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
router.post('/PrintPatientLabel', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.PrintPatientLabel(req.body)
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
router.post('/PrintPatientCard', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.PrintPatientCard(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/OPVisitCancel', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.OPVisitCancel(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientList', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.PrintPatientList(req.body)
        .then((response) => {
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
router.post('/PrintInActivePatientList', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.PrintInActivePatientList(req.body)
        .then((response) => {
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
router.post('/PrintIpForms', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.PrintIpForms(req.body)
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
router.post('/AddPatientMasterExcel', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientService, req);
    service.AddPatientMasterExcel(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});


export default router;
