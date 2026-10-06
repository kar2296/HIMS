import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { FamilySocialHistoryService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddFamilySocialHistory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FamilySocialHistoryService, req);
    service.AddFamilySocialHistory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateFamilySocialHistory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FamilySocialHistoryService, req);
    service.UpdateFamilySocialHistory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFamilySocialHistoryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FamilySocialHistoryService, req);
    service.GetFamilySocialHistoryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageFamilySocialHistorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FamilySocialHistoryService, req);
    service.ManageFamilySocialHistorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFamilySocialHistorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FamilySocialHistoryService, req);
    service.GetFamilySocialHistorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteFamilySocialHistory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FamilySocialHistoryService, req);
    service.DeleteFamilySocialHistory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
