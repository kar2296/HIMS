import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DosageLimitService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddDosageLimit', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DosageLimitService, req);
    service.AddDosageLimit(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDosageLimit', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DosageLimitService, req);
    service.UpdateDosageLimit(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDosageLimitById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DosageLimitService, req);
    service.GetDosageLimitById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDosageLimits', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DosageLimitService, req);
    service.GetDosageLimits(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteDosageLimit', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DosageLimitService, req);
    service.DeleteDosageLimit(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
