import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientLabourDetailService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientLabourDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientLabourDetailService, req);
    service.AddPatientLabourDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientLabourDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientLabourDetailService, req);
    service.UpdatePatientLabourDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientLabourDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientLabourDetailService, req);
    service.GetPatientLabourDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientLabourDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientLabourDetailService, req);
    service.GetPatientLabourDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientLabourDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientLabourDetailService, req);
    service.DeletePatientLabourDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientLabourDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientLabourDetailService, req);
    service.PrintPatientLabourDetail(req.body)
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
