import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientWorkOrderAntibioticsService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientWorkOrderAntibiotics', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkOrderAntibioticsService, req);
    service.AddPatientWorkOrderAntibiotics(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientWorkOrderAntibiotics', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkOrderAntibioticsService, req);
    service.UpdatePatientWorkOrderAntibiotics(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePatientWorkOrderAntibiotics', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkOrderAntibioticsService, req);
    service.ManagePatientWorkOrderAntibiotics(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientWorkOrderAntibioticsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkOrderAntibioticsService, req);
    service.GetPatientWorkOrderAntibioticsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientWorkOrderAntibioticss', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkOrderAntibioticsService, req);
    service.GetPatientWorkOrderAntibioticss(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientWorkOrderAntibiotics', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientWorkOrderAntibioticsService, req);
    service.DeletePatientWorkOrderAntibiotics(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
