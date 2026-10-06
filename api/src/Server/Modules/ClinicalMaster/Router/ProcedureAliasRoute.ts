import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ProcedureAliasService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddProcedureAlias', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureAliasService, req);
    service.AddProcedureAlias(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateProcedureAlias', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureAliasService, req);
    service.UpdateProcedureAlias(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProcedureAliasById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureAliasService, req);
    service.GetProcedureAliasById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProcedureAliass', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureAliasService, req);
    service.GetProcedureAliass(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteProcedureAlias', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureAliasService, req);
    service.DeleteProcedureAlias(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
