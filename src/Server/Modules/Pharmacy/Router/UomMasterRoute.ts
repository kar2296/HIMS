import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { UomMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddUomMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UomMasterService, req);
    service.AddUomMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateUomMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UomMasterService, req);
    service.UpdateUomMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUomMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UomMasterService, req);
    service.GetUomMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUomMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UomMasterService, req);
    service.GetUomMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteUomMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UomMasterService, req);
    service.DeleteUomMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
