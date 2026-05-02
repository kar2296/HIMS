import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { EncounterIPPackageServiceExclusionService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddEncounterIPPackageServiceExclusion', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageServiceExclusionService, req);
    service.AddEncounterIPPackageServiceExclusion(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateEncounterIPPackageServiceExclusion', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageServiceExclusionService, req);
    service.UpdateEncounterIPPackageServiceExclusion(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEncounterIPPackageServiceExclusionById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageServiceExclusionService, req);
    service.GetEncounterIPPackageServiceExclusionById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEncounterIPPackageServiceExclusions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageServiceExclusionService, req);
    service.GetEncounterIPPackageServiceExclusions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMinEncounterIPPackageServiceExclusions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageServiceExclusionService, req);
    service.GetMinEncounterIPPackageServiceExclusions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteEncounterIPPackageServiceExclusion', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageServiceExclusionService, req);
    service.DeleteEncounterIPPackageServiceExclusion(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
