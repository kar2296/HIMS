import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientRefundService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientRefund', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientRefundService, req);
    service.AddPatientRefund(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientRefund', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientRefundService, req);
    service.UpdatePatientRefund(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientRefundById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientRefundService, req);
    service.GetPatientRefundById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientRefund', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientRefundService, req);
    service.GetPatientRefund(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPharmacyReturnCollections', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientRefundService, req);
    service.GetPharmacyReturnCollections(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientRefund', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientRefundService, req);
    service.PrintPatientRefund(req.body)
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
router.post('/PrintRefundReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientRefundService, req);
    service.PrintRefundReport(req.body)
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
router.post('/PrintIPRefundReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientRefundService, req);
    service.PrintIPRefundReport(req.body)
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
router.post('/PrintPharmacyRefundReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientRefundService, req);
    service.PrintPharmacyRefundReport(req.body)
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
router.post('/DeletePatientRefund', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientRefundService, req);
    service.DeletePatientRefund(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientRefund', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientRefundService, req);
    service.PrintPatientRefund(req.body)
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

export default router;
