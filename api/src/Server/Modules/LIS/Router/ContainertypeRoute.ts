import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ContainertypeService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddContainertype', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ContainertypeService, req);
    service.AddContainertype(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateContainertype', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ContainertypeService, req);
    service.UpdateContainertype(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetContainertypeById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ContainertypeService, req);
    service.GetContainertypeById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetContainertypes', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ContainertypeService, req);
    service.GetContainertypes(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteContainertype', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ContainertypeService, req);
    service.DeleteContainertype(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
