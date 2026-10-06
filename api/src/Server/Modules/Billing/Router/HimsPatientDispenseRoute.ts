import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientDispenseService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientDispense', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDispenseService, req);
    service.AddPatientDispense(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientDispense', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDispenseService, req);
    service.UpdatePatientDispense(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDispenseById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDispenseService, req);
    service.GetPatientDispenseById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDispenses', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDispenseService, req);
    service.GetPatientDispenses(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDispensesForprint', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDispenseService, req);
    service.GetPatientDispensesForprint(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDispensedListWithoutDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDispenseService, req);
    service.GetPatientDispensedListWithoutDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDispensedList', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDispenseService, req);
    service.GetPatientDispensedList(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientDispense', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDispenseService, req);
    service.DeletePatientDispense(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/PrintPatientDispense', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDispenseService, req);
    service.PrintPatientDispense(req.body)
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
router.post('/PrintPatientIPDispensesReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDispenseService, req);
    service.PrintPatientIPDispensesReport(req.body)
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
