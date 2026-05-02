import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StateMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddStateMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StateMasterService, req);
    service.AddStateMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStateMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StateMasterService, req);
    service.UpdateStateMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStateMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StateMasterService, req);
    service.GetStateMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStateMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StateMasterService, req);
    service.GetStateMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStateMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StateMasterService, req);
    service.DeleteStateMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
