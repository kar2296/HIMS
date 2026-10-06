import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { IPPackageDetailService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddIPPackageDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageDetailService, req);
    service.AddIPPackageDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateIPPackageDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageDetailService, req);
    service.UpdateIPPackageDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIPPackageDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageDetailService, req);
    service.GetIPPackageDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIPPackageDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageDetailService, req);
    service.GetIPPackageDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteIPPackageDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageDetailService, req);
    service.DeleteIPPackageDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
