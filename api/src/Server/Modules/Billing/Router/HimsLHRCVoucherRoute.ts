import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { LHRCVoucherService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddLHRCVoucher', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LHRCVoucherService, req);
    service.AddLHRCVoucher(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateLHRCVoucher', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LHRCVoucherService, req);
    service.UpdateLHRCVoucher(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLHRCVoucherById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LHRCVoucherService, req);
    service.GetLHRCVoucherById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLHRCVouchers', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LHRCVoucherService, req);
    service.GetLHRCVouchers(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteLHRCVoucher', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LHRCVoucherService, req);
    service.DeleteLHRCVoucher(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintLHRCVoucher', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LHRCVoucherService, req);
    service.PrintLHRCVoucher(req.body)
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
