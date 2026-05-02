import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DepartmentLocationService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddDepartmentLocation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DepartmentLocationService, req);
    service.AddDepartmentLocation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDepartmentLocation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DepartmentLocationService, req);
    service.UpdateDepartmentLocation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDepartmentLocationById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DepartmentLocationService, req);
    service.GetDepartmentLocationById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDepartmentLocations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DepartmentLocationService, req);
    service.GetDepartmentLocations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteDepartmentLocation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DepartmentLocationService, req);
    service.DeleteDepartmentLocation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
