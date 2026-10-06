import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { WardUserMapService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddWardUserMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardUserMapService, req);
    service.AddWardUserMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateWardUserMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardUserMapService, req);
    service.UpdateWardUserMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetWardUserMapById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardUserMapService, req);
    service.GetWardUserMapById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetWardUserMaps', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardUserMapService, req);
    service.GetWardUserMaps(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteWardUserMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardUserMapService, req);
    service.DeleteWardUserMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
