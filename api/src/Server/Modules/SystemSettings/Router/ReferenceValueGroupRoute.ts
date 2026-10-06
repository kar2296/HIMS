import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ReferenceValueGroupService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddReferenceValueGroup', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferenceValueGroupService, req);
    service.AddReferenceValueGroup(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateReferenceValueGroup', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferenceValueGroupService, req);
    service.UpdateReferenceValueGroup(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetReferenceValueGroupById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferenceValueGroupService, req);
    service.GetReferenceValueGroupById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetReferenceValueGroups', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferenceValueGroupService, req);
    service.GetReferenceValueGroups(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteReferenceValueGroup', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferenceValueGroupService, req);
    service.DeleteReferenceValueGroup(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
