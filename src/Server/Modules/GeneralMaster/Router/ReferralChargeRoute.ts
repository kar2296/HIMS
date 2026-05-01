import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ReferralChargeService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddReferralCharge', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferralChargeService, req);
    service.AddReferralCharge(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateReferralCharge', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferralChargeService, req);
    service.UpdateReferralCharge(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetReferralChargeById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferralChargeService, req);
    service.GetReferralChargeById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetReferralCharges', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferralChargeService, req);
    service.GetReferralCharges(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteReferralCharge', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferralChargeService, req);
    service.DeleteReferralCharge(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
