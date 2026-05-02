import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientDeathService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientDeath', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDeathService, req);
    service.AddPatientDeath(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientDeath', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDeathService, req);
    service.UpdatePatientDeath(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDeathById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDeathService, req);
    service.GetPatientDeathById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDeaths', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDeathService, req);
    service.GetPatientDeaths(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientDeath', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDeathService, req);
    service.DeletePatientDeath(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
