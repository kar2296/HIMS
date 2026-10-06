import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ServiceItemPackageMapService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddServiceItemPackageMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemPackageMapService, req);
    service.AddServiceItemPackageMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateServiceItemPackageMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemPackageMapService, req);
    service.UpdateServiceItemPackageMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageSerivceItemPackageMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemPackageMapService, req);
    service.ManageSerivceItemPackageMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceItemPackageMapById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemPackageMapService, req);
    service.GetServiceItemPackageMapById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceItemPackageMaps', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemPackageMapService, req);
    service.GetServiceItemPackageMaps(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteServiceItemPackageMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemPackageMapService, req);
    service.DeleteServiceItemPackageMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
