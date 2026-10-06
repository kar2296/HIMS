import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { MRDLocationService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddMRDLocation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MRDLocationService, req);
    service.AddMRDLocation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateMRDLocation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MRDLocationService, req);
    service.UpdateMRDLocation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateMRDLocationFromRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MRDLocationService, req);
    service.UpdateMRDLocationFromRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateMRDLocationData', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MRDLocationService, req);
    service.UpdateMRDLocationData(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMRDLocationById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MRDLocationService, req);
    service.GetMRDLocationById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMRDLocations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MRDLocationService, req);
    service.GetMRDLocations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteMRDLocation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MRDLocationService, req);
    service.DeleteMRDLocation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
