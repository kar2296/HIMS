import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ProcedureTemplateService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddProcedureTemplate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureTemplateService, req);
    service.AddProcedureTemplate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateProcedureTemplate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureTemplateService, req);
    service.UpdateProcedureTemplate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProcedureTemplateById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureTemplateService, req);
    service.GetProcedureTemplateById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProcedureTemplates', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureTemplateService, req);
    service.GetProcedureTemplates(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteProcedureTemplate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureTemplateService, req);
    service.DeleteProcedureTemplate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
