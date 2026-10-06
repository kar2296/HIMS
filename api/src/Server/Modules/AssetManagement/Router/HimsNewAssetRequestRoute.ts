import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { NewAssetRequestService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddNewAssetRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(NewAssetRequestService, req);
    service.AddNewAssetRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateNewAssetRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(NewAssetRequestService, req);
    service.UpdateNewAssetRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetNewAssetRequestById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(NewAssetRequestService, req);
    service.GetNewAssetRequestById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetNewAssetRequests', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(NewAssetRequestService, req);
    service.GetNewAssetRequests(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteNewAssetRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(NewAssetRequestService, req);
    service.DeleteNewAssetRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintNewAssetRequestReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(NewAssetRequestService, req);
    service.PrintNewAssetRequestReport(req.body)
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
