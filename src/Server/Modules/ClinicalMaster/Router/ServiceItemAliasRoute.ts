import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ServiceItemAliasService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddServiceItemAlias', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemAliasService, req);
    service.AddServiceItemAlias(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateServiceItemAlias', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemAliasService, req);
    service.UpdateServiceItemAlias(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageSerivceItemAlias', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemAliasService, req);
    service.ManageSerivceItemAlias(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceItemAliasById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemAliasService, req);
    service.GetServiceItemAliasById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceItemAliass', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemAliasService, req);
    service.GetServiceItemAliass(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteServiceItemAlias', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemAliasService, req);
    service.DeleteServiceItemAlias(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
