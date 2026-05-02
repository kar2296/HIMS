import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ReferralService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddReferral', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferralService, req);
    service.AddReferral(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateReferral', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferralService, req);
    service.UpdateReferral(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetReferralById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferralService, req);
    service.GetReferralById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetReferrals', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferralService, req);
    service.GetReferrals(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteReferral', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferralService, req);
    service.DeleteReferral(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/MapUsers', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferralService, req);
    service.MapUsers(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUsers', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferralService, req);
    service.GetUsers(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintReferraloctorListReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferralService, req);
    service.PrintReferraloctorListReport(req.body)
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
