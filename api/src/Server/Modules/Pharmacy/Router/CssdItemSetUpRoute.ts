import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { CssdItemSetUpService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddCssdItemSetUp', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CssdItemSetUpService, req);
    service.AddCssdItemSetUp(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCssdItemSetUp', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CssdItemSetUpService, req);
    service.UpdateCssdItemSetUp(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCssdItemSetUpById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CssdItemSetUpService, req);
    service.GetCssdItemSetUpById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCssdItemSetUps', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CssdItemSetUpService, req);
    service.GetCssdItemSetUps(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteCssdItemSetUp', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CssdItemSetUpService, req);
    service.DeleteCssdItemSetUp(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
