import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { SectionMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddSectionMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SectionMasterService, req);
    service.AddSectionMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateSectionMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SectionMasterService, req);
    service.UpdateSectionMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSectionMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SectionMasterService, req);
    service.GetSectionMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSectionMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SectionMasterService, req);
    service.GetSectionMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteSectionMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SectionMasterService, req);
    service.DeleteSectionMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCategories', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SectionMasterService, req);
    service.GetCategories(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
    router.post('/MapCategories', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SectionMasterService, req);
    service.MapCategories(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
