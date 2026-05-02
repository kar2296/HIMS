import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientWorkorderObservationService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientWorkorderObservation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderObservationService, req);
    service.AddPatientWorkorderObservation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientWorkorderObservation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderObservationService, req);
    service.UpdatePatientWorkorderObservation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientWorkorderObservationById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderObservationService, req);
    service.GetPatientWorkorderObservationById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientWorkorderObservations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderObservationService, req);
    service.GetPatientWorkorderObservations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientWorkorderObservation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkorderObservationService, req);
    service.DeletePatientWorkorderObservation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
