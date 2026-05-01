import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AssetAuditDetailService } from '../Service/Index';
import { unlinkSync } from 'fs';


let router: Router = express.Router();

router.post('/AddAssetAuditDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetAuditDetailService, req);
    service.AddAssetAuditDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAssetAuditDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetAuditDetailService, req);
    service.UpdateAssetAuditDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAssetAuditDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetAuditDetailService, req);
    service.GetAssetAuditDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAssetAuditDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetAuditDetailService, req);
    service.GetAssetAuditDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAssetAuditDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetAuditDetailService, req);
    service.DeleteAssetAuditDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintAssetAudit', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetAuditDetailService, req);
    service.PrintAssetAudit(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintAssetAuditReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetAuditDetailService, req);
    service.PrintAssetAuditReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintAssetReconcileReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetAuditDetailService, req);
    service.PrintAssetReconcileReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
export default router;
