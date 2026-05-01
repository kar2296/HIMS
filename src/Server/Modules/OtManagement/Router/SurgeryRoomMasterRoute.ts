import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { SurgeryRoomMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddSurgeryRoomMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SurgeryRoomMasterService, req);
    service.AddSurgeryRoomMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateSurgeryRoomMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SurgeryRoomMasterService, req);
    service.UpdateSurgeryRoomMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSurgeryRoomMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SurgeryRoomMasterService, req);
    service.GetSurgeryRoomMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSurgeryRoomMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SurgeryRoomMasterService, req);
    service.GetSurgeryRoomMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteSurgeryRoomMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SurgeryRoomMasterService, req);
    service.DeleteSurgeryRoomMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
