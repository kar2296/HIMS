import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StorePreferenceService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddStorePreference', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StorePreferenceService, req);
    service.AddStorePreference(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStorePreference', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StorePreferenceService, req);
    service.UpdateStorePreference(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageStorePreferences', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StorePreferenceService, req);
    service.ManageStorePreferences(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStorePreferenceById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StorePreferenceService, req);
    service.GetStorePreferenceById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStorePreferences', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StorePreferenceService, req);
    service.GetStorePreferences(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/OPCanCancelFromBillSettings', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StorePreferenceService, req);
    service.OPCanCancelFromBillSettings(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/IPCanCancelFromBillSettings', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StorePreferenceService, req);
    service.IPCanCancelFromBillSettings(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/ReceiptCancelFromBillSettings', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StorePreferenceService, req);
    service.ReceiptCancelFromBillSettings(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});


router.post('/RefundCancelFromBillSettings', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StorePreferenceService, req);
    service.RefundCancelFromBillSettings(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});


router.post('/DeleteStorePreference', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StorePreferenceService, req);
    service.DeleteStorePreference(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
