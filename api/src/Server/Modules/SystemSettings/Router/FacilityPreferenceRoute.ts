import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { FacilityPreferenceService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddFacilityPreference', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityPreferenceService, req);
    service.AddFacilityPreference(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateFacilityPreference', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityPreferenceService, req);
    service.UpdateFacilityPreference(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageFacilityPreferences', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityPreferenceService, req);
    service.ManageFacilityPreferences(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFacilityPreferenceById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityPreferenceService, req);
    service.GetFacilityPreferenceById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFacilityPreferences', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityPreferenceService, req);
    service.GetFacilityPreferences(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/OPCanCancelFromBillSettings', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityPreferenceService, req);
    service.OPCanCancelFromBillSettings(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/IPCanCancelFromBillSettings', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityPreferenceService, req);
    service.IPCanCancelFromBillSettings(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/ReceiptCancelFromBillSettings', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityPreferenceService, req);
    service.ReceiptCancelFromBillSettings(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});


router.post('/RefundCancelFromBillSettings', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityPreferenceService, req);
    service.RefundCancelFromBillSettings(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});


router.post('/DeleteFacilityPreference', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityPreferenceService, req);
    service.DeleteFacilityPreference(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
