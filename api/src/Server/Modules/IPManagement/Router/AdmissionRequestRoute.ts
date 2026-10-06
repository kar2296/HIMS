import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AdmissionRequestService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddAdmissionRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AdmissionRequestService, req);
    service.AddAdmissionRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAdmissionRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AdmissionRequestService, req);
    service.UpdateAdmissionRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAdmissionRequestById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AdmissionRequestService, req);
    service.GetAdmissionRequestById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAdmissionRequests', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AdmissionRequestService, req);
    service.GetAdmissionRequests(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintAdmissionRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AdmissionRequestService, req);
    service.PrintAdmissionRequest(req.body)
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
router.post('/DeleteAdmissionRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AdmissionRequestService, req);
    service.DeleteAdmissionRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
