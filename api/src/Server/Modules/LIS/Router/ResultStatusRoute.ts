import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ResultStatusService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddResultStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ResultStatusService, req);
    service.AddResultStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateResultStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ResultStatusService, req);
    service.UpdateResultStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetResultStatusById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ResultStatusService, req);
    service.GetResultStatusById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetResultStatuss', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ResultStatusService, req);
    service.GetResultStatuss(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteResultStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ResultStatusService, req);
    service.DeleteResultStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
