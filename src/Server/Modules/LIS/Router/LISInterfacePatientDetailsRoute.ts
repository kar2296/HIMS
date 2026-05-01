import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { LISInterfacePatientDetailsService } from '../Service/Index';
let router: Router = express.Router();

router.post('/AddLISPatientDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LISInterfacePatientDetailsService, req);
    service.AddLISPatientDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateLISPatientDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LISInterfacePatientDetailsService, req);
    service.UpdateLISPatientDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLISPatientDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LISInterfacePatientDetailsService, req);
    service.GetLISPatientDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/GetLISPatientDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LISInterfacePatientDetailsService, req);
    service.GetLISPatientDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});


router.post('/DeleteLISResults', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LISInterfacePatientDetailsService, req);
    service.DeleteLISResults(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
