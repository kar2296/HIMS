import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { FacilityPreferenceMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddFacilityPreferenceMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityPreferenceMasterService, req);
    service.AddFacilityPreferenceMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateFacilityPreferenceMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityPreferenceMasterService, req);
    service.UpdateFacilityPreferenceMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFacilityPreferenceMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityPreferenceMasterService, req);
    service.GetFacilityPreferenceMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFacilityPreferenceMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityPreferenceMasterService, req);
    service.GetFacilityPreferenceMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteFacilityPreferenceMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityPreferenceMasterService, req);
    service.DeleteFacilityPreferenceMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
