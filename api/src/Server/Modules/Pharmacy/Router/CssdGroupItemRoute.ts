import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { CssdGroupItemService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddCssdGroupItem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CssdGroupItemService, req);
    service.AddCssdGroupItem(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCssdGroupItem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CssdGroupItemService, req);
    service.UpdateCssdGroupItem(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCssdGroupItemById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CssdGroupItemService, req);
    service.GetCssdGroupItemById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCssdGroupItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CssdGroupItemService, req);
    service.GetCssdGroupItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteCssdGroupItem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CssdGroupItemService, req);
    service.DeleteCssdGroupItem(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
