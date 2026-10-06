import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { CheckListService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddCheckList', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CheckListService, req);
    service.AddCheckList(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCheckList', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CheckListService, req);
    service.UpdateCheckList(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCheckListById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CheckListService, req);
    service.GetCheckListById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCheckLists', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CheckListService, req);
    service.GetCheckLists(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteCheckList', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CheckListService, req);
    service.DeleteCheckList(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
