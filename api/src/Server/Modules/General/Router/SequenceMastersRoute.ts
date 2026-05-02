import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { SequenceMastersService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddSequenceMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SequenceMastersService, req);
    service.AddSequenceMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateSequenceMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SequenceMastersService, req);
    service.UpdateSequenceMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSequenceMastersById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SequenceMastersService, req);
    service.GetSequenceMastersById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSequenceMasterss', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SequenceMastersService, req);
    service.GetSequenceMasterss(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteSequenceMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SequenceMastersService, req);
    service.DeleteSequenceMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/SyncRedisToSqlSequenceMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SequenceMastersService, req);
    service.SyncRedisToSqlSequenceMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/SyncSqlToRedisSequenceMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SequenceMastersService, req);
    service.SyncSqlToRedisSequenceMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
