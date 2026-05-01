import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { TemplateMasterDetailService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddTemplateMasterDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TemplateMasterDetailService, req);
    service.AddTemplateMasterDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateTemplateMasterDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TemplateMasterDetailService, req);
    service.UpdateTemplateMasterDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTemplateMasterDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TemplateMasterDetailService, req);
    service.GetTemplateMasterDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTemplateMasterDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TemplateMasterDetailService, req);
    service.GetTemplateMasterDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteTemplateMasterDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TemplateMasterDetailService, req);
    service.DeleteTemplateMasterDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
