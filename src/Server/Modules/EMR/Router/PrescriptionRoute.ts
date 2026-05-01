import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PrescriptionService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPrescription', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrescriptionService, req);
    service.AddPrescription(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePrescription', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrescriptionService, req);
    service.UpdatePrescription(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePrescriptionNote', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrescriptionService, req);
    service.ManagePrescriptionNote(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCancelPrescription', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrescriptionService, req);
    service.UpdateCancelPrescription(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPrescriptionById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrescriptionService, req);
    service.GetPrescriptionById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPrescriptions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrescriptionService, req);
    service.GetPrescriptions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPrescriptionsWithoutDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrescriptionService, req);
    service.GetPrescriptionsWithoutDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPendingPrescriptions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrescriptionService, req);
    service.GetPendingPrescriptions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePrescription', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrescriptionService, req);
    service.DeletePrescription(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPrescription', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrescriptionService, req);
    service.PrintPrescription(req.body)
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
router.post('/PrintActiveMedication', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrescriptionService, req);
    service.PrintActiveMedication(req.body)
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
