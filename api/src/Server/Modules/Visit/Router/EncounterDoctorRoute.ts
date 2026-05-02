import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { EncounterDoctorService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddEncounterDoctor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterDoctorService, req);
    service.AddEncounterDoctor(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateEncounterDoctor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterDoctorService, req);
    service.UpdateEncounterDoctor(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEncounterDoctorById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterDoctorService, req);
    service.GetEncounterDoctorById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTransferEncounterDoctors', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterDoctorService, req);
    service.GetTransferEncounterDoctors(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEncounterDoctors', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterDoctorService, req);
    service.GetEncounterDoctors(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceEncounterDoctors', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterDoctorService, req);
    service.GetServiceEncounterDoctors(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintCrossConsultation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterDoctorService, req);
    service.PrintCrossConsultation(req.body)
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
router.post('/DeleteEncounterDoctor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterDoctorService, req);
    service.DeleteEncounterDoctor(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/ManageIPEncounterDoctor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterDoctorService, req);
    service.ManageIPEncounterDoctor(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/ManageEncounterDoctor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterDoctorService, req);
    service.ManageEncounterDoctor(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
