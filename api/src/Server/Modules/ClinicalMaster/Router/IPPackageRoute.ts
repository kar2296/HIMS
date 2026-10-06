import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { IPPackageService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddIPPackage', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageService, req);
    service.AddIPPackage(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddIPPackageByTariff', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageService, req);
    service.AddIPPackageByTariff(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateIPPackage', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageService, req);
    service.UpdateIPPackage(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateIPPackageByTariff', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageService, req);
    service.UpdateIPPackageByTariff(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIPPackageById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageService, req);
    service.GetIPPackageById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIPPackages', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageService, req);
    service.GetIPPackages(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTariffIPPackages', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageService, req);
    service.GetTariffIPPackages(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteIPPackage', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPPackageService, req);
    service.DeleteIPPackage(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
