import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { OccupationService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddOccupation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OccupationService, req);
    service.AddOccupation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateOccupation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OccupationService, req);
    service.UpdateOccupation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOccupationById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OccupationService, req);
    service.GetOccupationById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOccupations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OccupationService, req);
    service.GetOccupations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteOccupation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OccupationService, req);
    service.DeleteOccupation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
