import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { CityMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddCityMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CityMasterService, req);
    service.AddCityMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCityMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CityMasterService, req);
    service.UpdateCityMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCityMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CityMasterService, req);
    service.GetCityMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCityMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CityMasterService, req);
    service.GetCityMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteCityMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CityMasterService, req);
    service.DeleteCityMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
