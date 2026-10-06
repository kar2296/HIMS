import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { OpticalItemMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddOpticalItemMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalItemMasterService, req);
    service.AddOpticalItemMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateOpticalItemMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalItemMasterService, req);
    service.UpdateOpticalItemMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOpticalItemMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalItemMasterService, req);
    service.GetOpticalItemMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOpticalItemMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalItemMasterService, req);
    service.GetOpticalItemMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteOpticalItemMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalItemMasterService, req);
    service.DeleteOpticalItemMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
