import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientVitalService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientVital', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientVitalService, req);
    service.AddPatientVital(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientVital', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientVitalService, req);
    service.UpdatePatientVital(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientVitalById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientVitalService, req);
    service.GetPatientVitalById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientVitals', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientVitalService, req);
    service.ManagePatientVitals(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientVitals', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientVitalService, req);
    service.GetPatientVitals(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientVital', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientVitalService, req);
    service.DeletePatientVital(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientVital', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientVitalService, req);
    service.PrintPatientVital(req.body)
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
router.post('/PrintPatientVitalWithoutHeader', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientVitalService, req);
    service.PrintPatientVitalWithoutHeader(req.body)
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


export default router;
