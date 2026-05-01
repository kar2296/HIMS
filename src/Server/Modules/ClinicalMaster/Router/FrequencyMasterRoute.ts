import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { FrequencyMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddFrequencyMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FrequencyMasterService, req);
    service.AddFrequencyMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateFrequencyMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FrequencyMasterService, req);
    service.UpdateFrequencyMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFrequencyMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FrequencyMasterService, req);
    service.GetFrequencyMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFrequencyMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FrequencyMasterService, req);
    service.GetFrequencyMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteFrequencyMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FrequencyMasterService, req);
    service.DeleteFrequencyMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
