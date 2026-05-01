import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { TemplateMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddTemplateMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TemplateMasterService, req);
    service.AddTemplateMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateTemplateMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TemplateMasterService, req);
    service.UpdateTemplateMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTemplateMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TemplateMasterService, req);
    service.GetTemplateMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTemplateMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TemplateMasterService, req);
    service.GetTemplateMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteTemplateMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TemplateMasterService, req);
    service.DeleteTemplateMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
