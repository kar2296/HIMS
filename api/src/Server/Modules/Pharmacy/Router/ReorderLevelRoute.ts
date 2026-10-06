import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ReorderLevelService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddReorderLevel', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReorderLevelService, req);
    service.AddReorderLevel(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateReorderLevel', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReorderLevelService, req);
    service.UpdateReorderLevel(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetReorderLevelById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReorderLevelService, req);
    service.GetReorderLevelById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetReorderLevels', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReorderLevelService, req);
    service.GetReorderLevels(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteReorderLevel', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReorderLevelService, req);
    service.DeleteReorderLevel(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
