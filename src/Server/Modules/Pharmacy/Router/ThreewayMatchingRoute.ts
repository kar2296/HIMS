import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ThreewayMatchingService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddThreewayMatching', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ThreewayMatchingService, req);
    service.AddThreewayMatching(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateThreewayMatching', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ThreewayMatchingService, req);
    service.UpdateThreewayMatching(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetThreewayMatchingId', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ThreewayMatchingService, req);
    service.GetThreewayMatchingById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetThreewayMatching', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ThreewayMatchingService, req);
    service.GetThreewayMatching(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteThreewayMatching', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ThreewayMatchingService, req);
    service.DeleteThreewayMatching(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
