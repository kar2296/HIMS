import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { EmarService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddEmar', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EmarService, req);
    service.AddEmar(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateEmar', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EmarService, req);
    service.UpdateEmar(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AdministerPrescribedInjection', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EmarService, req);
    service.AdministerPrescribedInjection(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEmarById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EmarService, req);
    service.GetEmarById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEmars', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EmarService, req);
    service.GetEmars(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteEmar', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EmarService, req);
    service.DeleteEmar(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
