import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PrescriptionDetailService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPrescriptionDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrescriptionDetailService, req);
    service.AddPrescriptionDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePrescriptionDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrescriptionDetailService, req);
    service.UpdatePrescriptionDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPrescriptionDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrescriptionDetailService, req);
    service.GetPrescriptionDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPrescriptionDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrescriptionDetailService, req);
    service.GetPrescriptionDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePrescriptionDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrescriptionDetailService, req);
    service.DeletePrescriptionDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPendingPrescriptionReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrescriptionDetailService, req);
    service.PrintPendingPrescriptionReport(req.body)
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
