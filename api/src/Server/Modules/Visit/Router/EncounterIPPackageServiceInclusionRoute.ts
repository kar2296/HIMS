import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { EncounterIPPackageServiceInclusionService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddEncounterIPPackageServiceInclusion', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageServiceInclusionService, req);
    service.AddEncounterIPPackageServiceInclusion(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateIPPackageServiceInclusion', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageServiceInclusionService, req);
    service.UpdateEncounterIPPackageServiceInclusion(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEncounterIPPackageServiceInclusionById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageServiceInclusionService, req);
    service.GetEncounterIPPackageServiceInclusionById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEncounterIPPackageServiceInclusions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageServiceInclusionService, req);
    service.GetEncounterIPPackageServiceInclusions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMinEncounterIPPackageServiceInclusions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageServiceInclusionService, req);
    service.GetMinEncounterIPPackageServiceInclusions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteEncounterIPPackageServiceInclusion', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageServiceInclusionService, req);
    service.DeleteEncounterIPPackageServiceInclusion(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
