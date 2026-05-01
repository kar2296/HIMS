import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { EncounterIPPackageDetailService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddEncounterIPPackageDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageDetailService, req);
    service.AddEncounterIPPackageDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateEncounterIPPackageDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageDetailService, req);
    service.UpdateEncounterIPPackageDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEncounterIPPackageDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageDetailService, req);
    service.GetEncounterIPPackageDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEncounterIPPackageDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageDetailService, req);
    service.GetEncounterIPPackageDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMinEncounterIPPackageDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageDetailService, req);
    service.GetMinEncounterIPPackageDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteEncounterIPPackageDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageDetailService, req);
    service.DeleteEncounterIPPackageDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
