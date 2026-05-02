import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientIntakeOutputService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientIntakeOutput', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientIntakeOutputService, req);
    service.AddPatientIntakeOutput(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientIntakeOutput', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientIntakeOutputService, req);
    service.UpdatePatientIntakeOutput(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientIntakeOutputById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientIntakeOutputService, req);
    service.GetPatientIntakeOutputById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientIntakeOutputs', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientIntakeOutputService, req);
    service.GetPatientIntakeOutputs(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientIntakeOutput', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientIntakeOutputService, req);
    service.DeletePatientIntakeOutput(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientIntakeOutput', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientIntakeOutputService, req);
    service.PrintPatientIntakeOutput(req.body)
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
