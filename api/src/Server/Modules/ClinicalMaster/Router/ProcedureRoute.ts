import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ProcedureService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddProcedure', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureService, req);
    service.AddProcedure(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateProcedure', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureService, req);
    service.UpdateProcedure(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProcedureById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureService, req);
    service.GetProcedureById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProcedures', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureService, req);
    service.GetProcedures(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteProcedure', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureService, req);
    service.DeleteProcedure(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
