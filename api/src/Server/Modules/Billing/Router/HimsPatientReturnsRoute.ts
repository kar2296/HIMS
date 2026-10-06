import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientReturnsService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientReturns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnsService, req);
    service.AddPatientReturns(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientReturns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnsService, req);
    service.UpdatePatientReturns(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddStaffBillReturns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnsService, req);
    service.AddStaffBillReturns(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStaffBillReturns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnsService, req);
    service.UpdateStaffBillReturns(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientReturnsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnsService, req);
    service.GetPatientReturnsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientReturns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnsService, req);
    service.GetPatientReturns(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStaffCreditReturns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnsService, req);
    service.GetStaffCreditReturns(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientReturns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnsService, req);
    service.DeletePatientReturns(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientReturns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnsService, req);
    service.PrintPatientReturns(req.body)
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
router.post('/PrintPatientReturns1', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnsService, req);
    service.PrintPatientReturns1(req.body)
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
router.post('/PrintPatientReturnsReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnsService, req);
    service.PrintPatientReturnsReport(req.body)
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
router.post('/PrintPharmacyReturnReportforOTC', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnsService, req);
    service.PrintPharmacyReturnReportforOTC(req.body)
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
router.post('/PrintIPPharmacyReturnReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnsService, req);
    service.PrintIPPharmacyReturnReport(req.body)
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
router.post('/PrintStaffCreditReturnReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnsService, req);
    service.PrintStaffCreditReturnReport(req.body)
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
router.post('/PrintDMPatientReturns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnsService, req);
    service.PrintDMPatientReturns(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintIPPatientReturns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnsService, req);
    service.PrintIPPatientReturns(req.body)
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
router.post('/PrintDMIPPatientReturns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnsService, req);
    service.PrintDMIPPatientReturns(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
    router.post('/PrintDirectPatientReturns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnsService, req);
    service.PrintDirectPatientReturns(req.body)
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
router.post('/PrintDMDirectPatientReturns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnsService, req);
    service.PrintDMDirectPatientReturns(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
