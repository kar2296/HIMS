import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DistrictMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddDistrictMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DistrictMasterService, req);
    service.AddDistrictMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDistrictMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DistrictMasterService, req);
    service.UpdateDistrictMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDistrictMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DistrictMasterService, req);
    service.GetDistrictMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDistrictMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DistrictMasterService, req);
    service.GetDistrictMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteDistrictMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DistrictMasterService, req);
    service.DeleteDistrictMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
