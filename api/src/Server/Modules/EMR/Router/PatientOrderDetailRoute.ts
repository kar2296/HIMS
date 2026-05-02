import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientOrderDetailService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientOrderDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderDetailService, req);
    service.AddPatientOrderDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientOrderDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderDetailService, req);
    service.UpdatePatientOrderDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientOrderDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderDetailService, req);
    service.GetPatientOrderDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientOrderDetailswithoutorder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderDetailService, req);
    service.GetPatientOrderDetailswithoutorder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientOrderDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderDetailService, req);
    service.GetPatientOrderDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTestStatisticsSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderDetailService, req);
    service.GetTestStatisticsSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientOrderDetailStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderDetailService, req);
    service.UpdatePatientOrderDetailStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTestEncountertypeSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderDetailService, req);
    service.GetTestEncountertypeSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientOrderDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderDetailService, req);
    service.DeletePatientOrderDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintLabDetailReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderDetailService, req);
    service.PrintLabDetailReport(req.body)
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
router.post('/PrintRadiologyDetailReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderDetailService, req);
    service.PrintRadiologyDetailReport(req.body)
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
router.post('/PrintLabSummaryByTest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderDetailService, req);
    service.PrintLabSummaryByTest(req.body)
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
router.post('/PrintLabStatisticsSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientOrderDetailService, req);
    service.PrintLabStatisticsSummary(req.body)
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
