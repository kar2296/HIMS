import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { OpticalGrnService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddOpticalGrn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalGrnService, req);
    service.AddOpticalGrn(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateOpticalGrn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalGrnService, req);
    service.UpdateOpticalGrn(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOpticalGrnById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalGrnService, req);
    service.GetOpticalGrnById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOpticalGrns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalGrnService, req);
    service.GetOpticalGrns(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteOpticalGrn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalGrnService, req);
    service.DeleteOpticalGrn(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/Print1Grn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalGrnService, req);
    service.Print1Grn(req.body)
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
