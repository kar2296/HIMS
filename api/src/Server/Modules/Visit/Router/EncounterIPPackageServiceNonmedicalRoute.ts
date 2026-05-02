import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { EncounterIPPackageServiceNonMedicalService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddEncounterIPPackageServiceNonMedical', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageServiceNonMedicalService, req);
    service.AddEncounterIPPackageServiceNonMedical(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateEncounterIPPackageServiceNonMedical', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageServiceNonMedicalService, req);
    service.UpdateEncounterIPPackageServiceNonMedical(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEncounterIPPackageServiceNonMedicalById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageServiceNonMedicalService, req);
    service.GetEncounterIPPackageServiceNonMedicalById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEncounterIPPackageServiceNonMedicals', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageServiceNonMedicalService, req);
    service.GetEncounterIPPackageServiceNonMedicals(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteEncounterIPPackageServiceNonMedical', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageServiceNonMedicalService, req);
    service.DeleteEncounterIPPackageServiceNonMedical(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
