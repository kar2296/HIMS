import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { EncounterGuarantorService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddEncounterGuarantor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterGuarantorService, req);
    service.AddEncounterGuarantor(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateEncounterGuarantor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterGuarantorService, req);
    service.UpdateEncounterGuarantor(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEncounterGuarantorById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterGuarantorService, req);
    service.GetEncounterGuarantorById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEncounterGuarantors', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterGuarantorService, req);
    service.GetEncounterGuarantors(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteEncounterGuarantor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterGuarantorService, req);
    service.DeleteEncounterGuarantor(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageEncounterGuarantor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterGuarantorService, req);
    service.ManageEncounterGuarantor(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
