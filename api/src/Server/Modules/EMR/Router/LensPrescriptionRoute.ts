import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { LensPrescriptionService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddLensPrescription', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LensPrescriptionService, req);
    service.AddLensPrescription(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateLensPrescription', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LensPrescriptionService, req);
    service.UpdateLensPrescription(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLensPrescriptionById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LensPrescriptionService, req);
    service.GetLensPrescriptionById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLensPrescriptions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LensPrescriptionService, req);
    service.GetLensPrescriptions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteLensPrescription', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LensPrescriptionService, req);
    service.DeleteLensPrescription(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintLensPrescription', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LensPrescriptionService, req);
    service.PrintLensPrescription(req.body)
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
