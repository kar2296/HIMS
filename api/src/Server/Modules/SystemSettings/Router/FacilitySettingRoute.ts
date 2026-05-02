import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { FacilitySettingService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddFacilitySetting', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilitySettingService, req);
    service.AddFacilitySetting(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateFacilitySetting', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilitySettingService, req);
    service.UpdateFacilitySetting(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFacilitySettingById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilitySettingService, req);
    service.GetFacilitySettingById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFacilitySettings', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilitySettingService, req);
    service.GetFacilitySettings(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteFacilitySetting', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilitySettingService, req);
    service.DeleteFacilitySetting(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
