import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ChiefComplaintService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddChiefComplaint', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ChiefComplaintService, req);
    service.AddChiefComplaint(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateChiefComplaint', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ChiefComplaintService, req);
    service.UpdateChiefComplaint(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetChiefComplaintById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ChiefComplaintService, req);
    service.GetChiefComplaintById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetChiefComplaints', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ChiefComplaintService, req);
    service.GetChiefComplaints(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteChiefComplaint', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ChiefComplaintService, req);
    service.DeleteChiefComplaint(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
