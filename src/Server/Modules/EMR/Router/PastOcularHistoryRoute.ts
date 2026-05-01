import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PastOcularHistoryService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPastOcularHistory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PastOcularHistoryService, req);
    service.AddPastOcularHistory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePastOcularHistory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PastOcularHistoryService, req);
    service.UpdatePastOcularHistory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPastOcularHistoryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PastOcularHistoryService, req);
    service.GetPastOcularHistoryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPastOcularHistorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PastOcularHistoryService, req);
    service.GetPastOcularHistorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePastOcularHistory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PastOcularHistoryService, req);
    service.DeletePastOcularHistory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
