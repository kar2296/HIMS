import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DeviceService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddDevice', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DeviceService, req);
    service.AddDevice(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDevice', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DeviceService, req);
    service.UpdateDevice(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDeviceById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DeviceService, req);
    service.GetDeviceById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDevices', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DeviceService, req);
    service.GetDevices(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteDevice', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DeviceService, req);
    service.DeleteDevice(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
