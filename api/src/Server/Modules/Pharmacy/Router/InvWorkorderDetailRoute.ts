import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { InvWorkorderDetailService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddInvWorkorderDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InvWorkorderDetailService, req);
    service.AddInvWorkorderDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateInvWorkorderDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InvWorkorderDetailService, req);
    service.UpdateInvWorkorderDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetInvWorkorderDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InvWorkorderDetailService, req);
    service.GetInvWorkorderDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetInvWorkorderDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InvWorkorderDetailService, req);
    service.GetInvWorkorderDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteInvWorkorderDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InvWorkorderDetailService, req);
    service.DeleteInvWorkorderDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
