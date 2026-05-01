import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DeviceManufacturerService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddDeviceManufacturer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DeviceManufacturerService, req);
    service.AddDeviceManufacturer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDeviceManufacturer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DeviceManufacturerService, req);
    service.UpdateDeviceManufacturer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDeviceManufacturerById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DeviceManufacturerService, req);
    service.GetDeviceManufacturerById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDeviceManufacturers', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DeviceManufacturerService, req);
    service.GetDeviceManufacturers(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteDeviceManufacturer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DeviceManufacturerService, req);
    service.DeleteDeviceManufacturer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
