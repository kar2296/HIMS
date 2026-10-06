import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { IPPackageServiceExclusionService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddIPPackageServiceExclusion', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageServiceExclusionService, req);
    service.AddIPPackageServiceExclusion(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateIPPackageServiceExclusion', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageServiceExclusionService, req);
    service.UpdateIPPackageServiceExclusion(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIPPackageServiceExclusionById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageServiceExclusionService, req);
    service.GetIPPackageServiceExclusionById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIPPackageServiceExclusions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageServiceExclusionService, req);
    service.GetIPPackageServiceExclusions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteIPPackageServiceExclusion', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageServiceExclusionService, req);
    service.DeleteIPPackageServiceExclusion(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
