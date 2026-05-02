import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { LHRCVoucherDetailService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddLHRCVoucherDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LHRCVoucherDetailService, req);
    service.AddLHRCVoucherDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateLHRCVoucherDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LHRCVoucherDetailService, req);
    service.UpdateLHRCVoucherDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLHRCVoucherDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LHRCVoucherDetailService, req);
    service.GetLHRCVoucherDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLHRCVoucherDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LHRCVoucherDetailService, req);
    service.GetLHRCVoucherDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteLHRCVoucherDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LHRCVoucherDetailService, req);
    service.DeleteLHRCVoucherDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
