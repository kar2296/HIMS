import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { BillingSettingService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddBillingSetting', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BillingSettingService, req);
    service.AddBillingSetting(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateBillingSetting', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BillingSettingService, req);
    service.UpdateBillingSetting(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBillingSettingById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BillingSettingService, req);
    service.GetBillingSettingById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBillingSettings', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BillingSettingService, req);
    service.GetBillingSettings(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteBillingSetting', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BillingSettingService, req);
    service.DeleteBillingSetting(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
