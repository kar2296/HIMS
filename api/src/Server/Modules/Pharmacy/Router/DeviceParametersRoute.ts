import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DeviceParametersService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddDeviceParameters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DeviceParametersService, req);
    service.AddDeviceParameters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDeviceParameters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DeviceParametersService, req);
    service.UpdateDeviceParameters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDeviceParametersById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DeviceParametersService, req);
    service.GetDeviceParametersById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDeviceParameterss', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DeviceParametersService, req);
    service.GetDeviceParameterss(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteDeviceParameters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DeviceParametersService, req);
    service.DeleteDeviceParameters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
