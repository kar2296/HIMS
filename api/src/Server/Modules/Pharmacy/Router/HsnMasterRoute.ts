import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { HsnMasterService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddHsnMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(HsnMasterService, req);
    service.AddHsnMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateHsnMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(HsnMasterService, req);
    service.UpdateHsnMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetHsnMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(HsnMasterService, req);
    service.GetHsnMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetHsnMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(HsnMasterService, req);
    service.GetHsnMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteHsnMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(HsnMasterService, req);
    service.DeleteHsnMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
