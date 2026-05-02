import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DietItemMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddDietItemMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DietItemMasterService, req);
    service.AddDietItemMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDietItemMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DietItemMasterService, req);
    service.UpdateDietItemMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDietItemMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DietItemMasterService, req);
    service.GetDietItemMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDietItemMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DietItemMasterService, req);
    service.GetDietItemMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteDietItemMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DietItemMasterService, req);
    service.DeleteDietItemMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
