import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AssetInsuranceService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddAssetInsurance', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetInsuranceService, req);
    service.AddAssetInsurance(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAssetInsurance', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetInsuranceService, req);
    service.UpdateAssetInsurance(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAssetInsuranceById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetInsuranceService, req);
    service.GetAssetInsuranceById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAssetInsurances', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetInsuranceService, req);
    service.GetAssetInsurances(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAssetInsurance', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetInsuranceService, req);
    service.DeleteAssetInsurance(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintAssetInsurance', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetInsuranceService, req);
    service.PrintAssetInsurance(req.body)
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
router.post('/PrintAssetInsuranceReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssetInsuranceService, req);
    service.PrintAssetInsuranceReport(req.body)
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
