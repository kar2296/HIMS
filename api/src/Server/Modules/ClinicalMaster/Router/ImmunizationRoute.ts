import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ImmunizationService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddImmunization', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ImmunizationService, req);
    service.AddImmunization(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateImmunization', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ImmunizationService, req);
    service.UpdateImmunization(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetImmunizationById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ImmunizationService, req);
    service.GetImmunizationById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetImmunizations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ImmunizationService, req);
    service.GetImmunizations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteImmunization', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ImmunizationService, req);
    service.DeleteImmunization(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
