import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AssetWarrantyService } from '../Service/Index';
import { unlinkSync } from 'fs';


let router: Router = express.Router();

router.post('/AddAssetWarranty', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetWarrantyService, req);
    service.AddAssetWarranty(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAssetWarranty', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetWarrantyService, req);
    service.UpdateAssetWarranty(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAssetWarrantyById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetWarrantyService, req);
    service.GetAssetWarrantyById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAssetWarranties', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetWarrantyService, req);
    service.GetAssetWarranties(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAssetWarranty', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetWarrantyService, req);
    service.DeleteAssetWarranty(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintAssetWarranty', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetWarrantyService, req);
    service.PrintAssetWarranty(req.body)
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
router.post('/PrintAssetwarrantyexpiredReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetWarrantyService, req);
    service.PrintAssetwarrantyexpiredReport(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
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
router.post('/PrintAssetwarrantyexpiryReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetWarrantyService, req);
    service.PrintAssetwarrantyexpiryReport(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
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
