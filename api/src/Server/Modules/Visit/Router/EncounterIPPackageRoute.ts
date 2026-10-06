import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { EncounterIPPackageService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddEncounterIPPackage', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageService, req);
    service.AddEncounterIPPackage(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateEncounterIPPackage', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageService, req);
    service.UpdateEncounterIPPackage(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateEncounterIPPackageInfo', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageService, req);
    service.UpdateEncounterIPPackageInfo(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEncounterIPPackageById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageService, req);
    service.GetEncounterIPPackageById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePackageBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageService, req);
    service.ManagePackageBillDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePackageBillInfo', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageService, req);
    service.ManagePackageBillInfo(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEncounterIPPackages', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageService, req);
    service.GetEncounterIPPackages(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteEncounterIPPackage', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageService, req);
    service.DeleteEncounterIPPackage(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintIPPatientPackageDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageService, req);
    service.PrintIPPatientPackageDetails(req.body)
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
router.post('/PrintIPPatientInclusionPackageDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterIPPackageService, req);
    service.PrintIPPatientInclusionPackageDetails(req.body)
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
