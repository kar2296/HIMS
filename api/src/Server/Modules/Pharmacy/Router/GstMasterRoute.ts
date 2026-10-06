import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { GstMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddGstMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GstMasterService, req);
    service.AddGstMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateGstMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GstMasterService, req);
    service.UpdateGstMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGstMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GstMasterService, req);
    service.GetGstMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGstMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GstMasterService, req);
    service.GetGstMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteGstMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GstMasterService, req);
    service.DeleteGstMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
