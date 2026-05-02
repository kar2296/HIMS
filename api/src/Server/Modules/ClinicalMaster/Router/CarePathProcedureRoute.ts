import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { CarePathProcedureService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddCarePathProcedure', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathProcedureService, req);
    service.AddCarePathProcedure(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCarePathProcedure', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathProcedureService, req);
    service.UpdateCarePathProcedure(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCarePathProcedureById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathProcedureService, req);
    service.GetCarePathProcedureById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCarePathProcedures', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathProcedureService, req);
    service.GetCarePathProcedures(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteCarePathProcedure', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathProcedureService, req);
    service.DeleteCarePathProcedure(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
