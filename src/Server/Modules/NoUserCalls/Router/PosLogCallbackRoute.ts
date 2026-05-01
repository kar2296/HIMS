import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PosLogService, PosMomentLogService } from '../../Billing/Service/Index';
import { DynamicQRLogService } from '../../Billing/Service/Index';
import * as bodyParser from 'body-parser';

let router: Router = express.Router();

router.post('/CallBack',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PosLogService, req);
        service.CallBack(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/QRCallBack',bodyParser.text(),
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(DynamicQRLogService, req);
        service.CallBack(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });

router.post('/POSMomentCallBack',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PosMomentLogService, req);
        service.POSMomentCallBack(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });

export default router;
