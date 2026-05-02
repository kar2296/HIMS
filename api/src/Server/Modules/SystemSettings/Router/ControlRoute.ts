import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ControlService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddControl', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ControlService, req);
    service.AddControl(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateControl', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ControlService, req);
    service.UpdateControl(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetControlById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ControlService, req);
    service.GetControlById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetControls', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ControlService, req);
    service.GetControls(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteControl', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ControlService, req);
    service.DeleteControl(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
