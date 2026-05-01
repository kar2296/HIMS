import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { EncounterMLCOfficerService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddEncounterMLCOfficer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterMLCOfficerService, req);
    service.AddEncounterMLCOfficer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateEncounterMLCOfficer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterMLCOfficerService, req);
    service.UpdateEncounterMLCOfficer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEncounterMLCOfficerById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterMLCOfficerService, req);
    service.GetEncounterMLCOfficerById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEncounterMLCOfficers', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterMLCOfficerService, req);
    service.GetEncounterMLCOfficers(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteEncounterMLCOfficer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterMLCOfficerService, req);
    service.DeleteEncounterMLCOfficer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
