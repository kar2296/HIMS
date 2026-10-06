import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DrawsiteService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddDrawsite', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrawsiteService, req);
    service.AddDrawsite(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDrawsite', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrawsiteService, req);
    service.UpdateDrawsite(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDrawsiteById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrawsiteService, req);
    service.GetDrawsiteById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDrawsites', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrawsiteService, req);
    service.GetDrawsites(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteDrawsite', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrawsiteService, req);
    service.DeleteDrawsite(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
