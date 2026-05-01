import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { OtRequestService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddOtRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtRequestService, req);
    service.AddOtRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateOtRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtRequestService, req);
    service.UpdateOtRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOtRequestById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtRequestService, req);
    service.GetOtRequestById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOtRequests', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtRequestService, req);
    service.GetOtRequests(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteOtRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtRequestService, req);
    service.DeleteOtRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
