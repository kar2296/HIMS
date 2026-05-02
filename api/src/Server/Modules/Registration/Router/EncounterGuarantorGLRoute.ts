import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { EncounterGuarantorGLService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddEncounterGuarantorGL', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterGuarantorGLService, req);
    service.AddEncounterGuarantorGL(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateEncounterGuarantorGL', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterGuarantorGLService, req);
    service.UpdateEncounterGuarantorGL(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEncounterGuarantorGLById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterGuarantorGLService, req);
    service.GetEncounterGuarantorGLById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEncounterGuarantorGLs', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterGuarantorGLService, req);
    service.GetEncounterGuarantorGLs(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteEncounterGuarantorGL', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterGuarantorGLService, req);
    service.DeleteEncounterGuarantorGL(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
