import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { LocationMasterService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddLocationMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LocationMasterService, req);
    service.AddLocationMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateLocationMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LocationMasterService, req);
    service.UpdateLocationMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLocationMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LocationMasterService, req);
    service.GetLocationMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLocationMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LocationMasterService, req);
    service.GetLocationMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteLocationMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LocationMasterService, req);
    service.DeleteLocationMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
