import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ImpressionMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddImpressionMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ImpressionMasterService, req);
    service.AddImpressionMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateImpressionMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ImpressionMasterService, req);
    service.UpdateImpressionMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetImpressionMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ImpressionMasterService, req);
    service.GetImpressionMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetImpressionMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ImpressionMasterService, req);
    service.GetImpressionMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteImpressionMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ImpressionMasterService, req);
    service.DeleteImpressionMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
