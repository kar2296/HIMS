import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AERegistrationService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddAERegistration', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AERegistrationService, req);
    service.AddAERegistration(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAERegistration', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AERegistrationService, req);
    service.UpdateAERegistration(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAERegistrationById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AERegistrationService, req);
    service.GetAERegistrationById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAERegistrations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AERegistrationService, req);
    service.GetAERegistrations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAERegistration', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AERegistrationService, req);
    service.DeleteAERegistration(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
