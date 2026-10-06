import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ServiceGroupRateMappingService } from '../Service/Index';
let router: Router = express.Router();

router.post('/AddServiceGroupRateMapping', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceGroupRateMappingService, req);
    service.AddServiceGroupRateMapping(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateServiceGroupRateMapping', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceGroupRateMappingService, req);
    service.UpdateServiceGroupRateMapping(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceGroupRateMappingById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceGroupRateMappingService, req);
    service.GetServiceGroupRateMappingById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAllServiceGroupRateMapping', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceGroupRateMappingService, req);
    service.GetAllServiceGroupRateMapping(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteServiceGroupRateMapping', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceGroupRateMappingService, req);
    service.DeleteServiceGroupRateMapping(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
