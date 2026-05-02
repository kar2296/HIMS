import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { WardRoomServiceMapService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddWardRoomServiceMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardRoomServiceMapService, req);
    service.AddWardRoomServiceMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateWardRoomServiceMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardRoomServiceMapService, req);
    service.UpdateWardRoomServiceMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetWardRoomServiceMapById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardRoomServiceMapService, req);
    service.GetWardRoomServiceMapById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetWardRoomServiceMaps', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardRoomServiceMapService, req);
    service.GetWardRoomServiceMaps(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRoomChargesDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardRoomServiceMapService, req);
    service.GetRoomChargesDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteWardRoomServiceMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardRoomServiceMapService, req);
    service.DeleteWardRoomServiceMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
