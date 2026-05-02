import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientDietNbmService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientDietNbm', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietNbmService, req);
    service.AddPatientDietNbm(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientDietNbm', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietNbmService, req);
    service.UpdatePatientDietNbm(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDietNbmById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietNbmService, req);
    service.GetPatientDietNbmById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDietNbms', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietNbmService, req);
    service.GetPatientDietNbms(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientDietNbm', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDietNbmService, req);
    service.DeletePatientDietNbm(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
