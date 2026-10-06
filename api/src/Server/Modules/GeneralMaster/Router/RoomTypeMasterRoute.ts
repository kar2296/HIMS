import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { RoomTypeMasterService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddRoomTypeMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RoomTypeMasterService, req);
    service.AddRoomTypeMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateRoomTypeMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RoomTypeMasterService, req);
    service.UpdateRoomTypeMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRoomTypeMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RoomTypeMasterService, req);
    service.GetRoomTypeMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRoomTypeMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RoomTypeMasterService, req);
    service.GetRoomTypeMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteRoomTypeMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RoomTypeMasterService, req);
    service.DeleteRoomTypeMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
