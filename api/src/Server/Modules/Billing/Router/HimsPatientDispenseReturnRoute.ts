import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientDispenseReturnService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientDispenseReturn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDispenseReturnService, req);
    service.AddPatientDispenseReturn(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientDispenseReturn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDispenseReturnService, req);
    service.UpdatePatientDispenseReturn(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDispenseReturnById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDispenseReturnService, req);
    service.GetPatientDispenseReturnById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDispenseReturns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDispenseReturnService, req);
    service.GetPatientDispenseReturns(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientDispenseReturn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDispenseReturnService, req);
    service.DeletePatientDispenseReturn(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/PrintPatientDispenseReturn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDispenseReturnService, req);
    service.PrintPatientDispenseReturn(req.body)
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
