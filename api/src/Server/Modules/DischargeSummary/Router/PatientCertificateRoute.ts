import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import {PatientCertificateService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientCertificate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCertificateService, req);
    service.AddPatientCertificate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientCertificate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCertificateService, req);
    service.UpdatePatientCertificate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientCertificateById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCertificateService, req);
    service.GetPatientCertificateById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientCertificates', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCertificateService, req);
    service.GetPatientCertificates(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientCertificate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCertificateService, req);
    service.DeletePatientCertificate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientCertificate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCertificateService, req);
    service.PrintPatientCertificate(req.body)
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
router.post('/PrintPatientCertificatewithoutheader', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCertificateService, req);
    service.PrintPatientCertificatewithoutheader(req.body)
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
