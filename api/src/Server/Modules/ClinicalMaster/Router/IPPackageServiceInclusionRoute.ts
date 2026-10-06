import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { IPPackageServiceInclusionService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddIPPackageServiceInclusion', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageServiceInclusionService, req);
    service.AddIPPackageServiceInclusion(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateIPPackageServiceInclusion', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageServiceInclusionService, req);
    service.UpdateIPPackageServiceInclusion(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIPPackageServiceInclusionById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageServiceInclusionService, req);
    service.GetIPPackageServiceInclusionById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIPPackageServiceInclusions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageServiceInclusionService, req);
    service.GetIPPackageServiceInclusions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteIPPackageServiceInclusion', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageServiceInclusionService, req);
    service.DeleteIPPackageServiceInclusion(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
