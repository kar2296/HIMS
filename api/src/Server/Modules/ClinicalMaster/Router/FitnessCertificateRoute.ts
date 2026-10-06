import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { FitnessCertificateService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddFitnessCertificate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FitnessCertificateService, req);
    service.AddFitnessCertificate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateFitnessCertificate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FitnessCertificateService, req);
    service.UpdateFitnessCertificate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFitnessCertificateById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FitnessCertificateService, req);
    service.GetFitnessCertificateById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFitnessCertificates', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FitnessCertificateService, req);
    service.GetFitnessCertificates(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteFitnessCertificate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FitnessCertificateService, req);
    service.DeleteFitnessCertificate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintFitnessCertificate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FitnessCertificateService, req);
    service.PrintFitnessCertificate(req.body)
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
