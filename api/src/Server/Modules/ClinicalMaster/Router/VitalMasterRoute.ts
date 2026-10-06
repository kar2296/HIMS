import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { VitalMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddVitalMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VitalMasterService, req);
    service.AddVitalMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateVitalMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VitalMasterService, req);
    service.UpdateVitalMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVitalMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VitalMasterService, req);
    service.GetVitalMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVitalMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VitalMasterService, req);
    service.GetVitalMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteVitalMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VitalMasterService, req);
    service.DeleteVitalMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
