import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PMRService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPMR',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PMRService, req);
        service.AddPMR(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdatePMR',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PMRService, req);
        service.UpdatePMR(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetPMRById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PMRService, req);
    service.GetPMRById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPMRProcedures', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PMRService, req);
    service.GetPMRProcedures(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPMRs', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PMRService, req);
    service.GetPMRs(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPMRItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PMRService, req);
    service.GetPMRItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePMR', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PMRService, req);
    service.DeletePMR(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
