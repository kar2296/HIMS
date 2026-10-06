import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientDoctorShareDetailsService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientDoctorShareDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDoctorShareDetailsService, req);
    service.AddPatientDoctorShareDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientDoctorShareDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDoctorShareDetailsService, req);
    service.UpdatePatientDoctorShareDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientDoctorShareDetailsUpdate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDoctorShareDetailsService, req);
    service.ManagePatientDoctorShareDetailsUpdate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/UpdatePatientShareInfoDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDoctorShareDetailsService, req);
    service.UpdatePatientShareInfoDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDoctorShareDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDoctorShareDetailsService, req);
    service.GetPatientDoctorShareDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDoctorShareDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDoctorShareDetailsService, req);
    service.GetPatientDoctorShareDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintDoctorShareDetailReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDoctorShareDetailsService, req);
    service.PrintDoctorShareDetailReport(req.body)
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
router.post('/PrintDoctorShareSummaryReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDoctorShareDetailsService, req);
    service.PrintDoctorShareSummaryReport(req.body)
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
router.post('/PrintDailyWiseDoctorShareSummaryReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDoctorShareDetailsService, req);
    service.PrintDailyWiseDoctorShareSummaryReport(req.body)
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
