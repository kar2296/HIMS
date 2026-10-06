import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { EntityPrintHistoryService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddEntityPrintHistory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EntityPrintHistoryService, req);
    service.AddEntityPrintHistory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateEntityPrintHistory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EntityPrintHistoryService, req);
    service.UpdateEntityPrintHistory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEntityPrintHistoryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EntityPrintHistoryService, req);
    service.GetEntityPrintHistoryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEntityPrintHistorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EntityPrintHistoryService, req);
    service.GetEntityPrintHistorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteEntityPrintHistory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EntityPrintHistoryService, req);
    service.DeleteEntityPrintHistory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
