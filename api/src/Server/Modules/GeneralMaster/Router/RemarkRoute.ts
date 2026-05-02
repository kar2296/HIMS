import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { RemarkService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddRemark', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RemarkService, req);
    service.AddRemark(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateRemark', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RemarkService, req);
    service.UpdateRemark(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRemarkById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RemarkService, req);
    service.GetRemarkById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRemarks', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RemarkService, req);
    service.GetRemarks(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteRemark', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RemarkService, req);
    service.DeleteRemark(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
