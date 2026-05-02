import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ProcedureServicesService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddProcedureServices', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureServicesService, req);
    service.AddProcedureServices(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateProcedureServices', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureServicesService, req);
    service.UpdateProcedureServices(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageProcedureServices', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureServicesService, req);
    service.ManageProcedureServices(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProcedureServicesById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureServicesService, req);
    service.GetProcedureServicesById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProcedureServices', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureServicesService, req);
    service.GetProcedureServices(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteProcedureServices', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProcedureServicesService, req);
    service.DeleteProcedureServices(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
