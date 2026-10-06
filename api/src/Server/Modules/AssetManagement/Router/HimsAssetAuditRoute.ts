import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AssetAuditService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddAssetAudit', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetAuditService, req);
    service.AddAssetAudit(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAssetAudit', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetAuditService, req);
    service.UpdateAssetAudit(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAssetAuditById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetAuditService, req);
    service.GetAssetAuditById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAssetAudits', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetAuditService, req);
    service.GetAssetAudits(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAssetAudit', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetAuditService, req);
    service.DeleteAssetAudit(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
