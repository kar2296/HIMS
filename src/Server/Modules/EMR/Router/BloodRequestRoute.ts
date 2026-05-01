import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { BloodRequestService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddBloodRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BloodRequestService, req);
    service.AddBloodRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateBloodRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BloodRequestService, req);
    service.UpdateBloodRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBloodRequestById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BloodRequestService, req);
    service.GetBloodRequestById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBloodRequests', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BloodRequestService, req);
    service.GetBloodRequests(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteBloodRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BloodRequestService, req);
    service.DeleteBloodRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
