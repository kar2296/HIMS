import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientWorkorderdetailsService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientWorkorderdetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderdetailsService, req);
    service.AddPatientWorkorderdetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientWorkorderdetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderdetailsService, req);
    service.UpdatePatientWorkorderdetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateIsLISRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderdetailsService, req);
    service.UpdateIsLISRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientWorkorderdetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderdetailsService, req);
    service.GetPatientWorkorderdetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientWorkorderdetailss', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderdetailsService, req);
    service.GetPatientWorkorderdetailss(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMinPatientWorkorderdetailss', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderdetailsService, req);
    service.GetMinPatientWorkorderdetailss(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientWorkorderdetailssForCorrelation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderdetailsService, req);
    service.GetPatientWorkorderdetailssForCorrelation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientWorkorderdetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderdetailsService, req);
    service.DeletePatientWorkorderdetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAnalyzerAllBarcodeInfo', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderdetailsService, req);
    service.GetAnalyzerAllBarcodeInfo(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAnalyzerTestdetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderdetailsService, req);
    service.GetAnalyzerTestdetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEncounterTypeBySample', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderdetailsService, req);
    service.GetEncounterTypeBySample(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintLabOrderStatisticsReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderdetailsService, req);
    service.PrintLabOrderStatisticsReport(req.body)
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
router.post('/PrintRadiologyOrderStatisticsReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderdetailsService, req);
    service.PrintRadiologyOrderStatisticsReport(req.body)
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
router.post('/PrintLabSummaryBySample', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderdetailsService, req);
    service.PrintLabSummaryBySample(req.body)
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
