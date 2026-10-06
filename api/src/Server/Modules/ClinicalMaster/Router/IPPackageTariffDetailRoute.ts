import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { IPPackageTariffDetailService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddIPPackageTariffDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageTariffDetailService, req);
    service.AddIPPackageTariffDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateIPPackageTariffDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageTariffDetailService, req);
    service.UpdateIPPackageTariffDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIPPackageTariffDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageTariffDetailService, req);
    service.GetIPPackageTariffDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIPPackageTariffDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageTariffDetailService, req);
    service.GetIPPackageTariffDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteIPPackageTariffDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageTariffDetailService, req);
    service.DeleteIPPackageTariffDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
