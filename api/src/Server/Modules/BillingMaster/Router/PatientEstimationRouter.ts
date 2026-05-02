import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientEstimationService } from '../Service/Index';
let router: Router = express.Router();
import { unlinkSync } from 'fs';

router.post('/AddPatientEstimation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientEstimationService, req);
    service.AddPatientEstimation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientEstimation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientEstimationService, req);
    service.UpdatePatientEstimation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientEstimationById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientEstimationService, req);
    service.GetPatientEstimationById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientEstimation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientEstimationService, req);
    service.GetPatientEstimation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientEstimation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientEstimationService, req);
    service.DeletePatientEstimation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientEstimation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientEstimationService, req);
    service.PrintPatientEstimation(req.body)
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
router.post('/PrintPatientEstimationwithoutheader', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientEstimationService, req);
    service.PrintPatientEstimationwithoutheader(req.body)
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
