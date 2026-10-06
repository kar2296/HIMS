import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { InvWorkorderService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddInvWorkorder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InvWorkorderService, req);
    service.AddInvWorkorder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateInvWorkorder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InvWorkorderService, req);
    service.UpdateInvWorkorder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetInvWorkorderById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InvWorkorderService, req);
    service.GetInvWorkorderById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetInvWorkorders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InvWorkorderService, req);
    service.GetInvWorkorders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteInvWorkorder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InvWorkorderService, req);
    service.DeleteInvWorkorder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintInvWorkOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InvWorkorderService, req);
    service.PrintInvWorkOrder(req.body)
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
router.post('/PrintwithoutInvWorkOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InvWorkorderService, req);
    service.PrintwithoutInvWorkOrder(req.body)
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
