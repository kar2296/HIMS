import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { OrgIsolationService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddOrgIsolation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrgIsolationService, req);
    service.AddOrgIsolation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateOrgIsolation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrgIsolationService, req);
    service.UpdateOrgIsolation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOrgIsolationById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrgIsolationService, req);
    service.GetOrgIsolationById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOrgIsolations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrgIsolationService, req);
    service.GetOrgIsolations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteOrgIsolation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrgIsolationService, req);
    service.DeleteOrgIsolation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
