import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AETriageService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddAETriage', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AETriageService, req);
    service.AddAETriage(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAETriage', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AETriageService, req);
    service.UpdateAETriage(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAETriageById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AETriageService, req);
    service.GetAETriageById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAETriages', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AETriageService, req);
    service.GetAETriages(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAETriage', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AETriageService, req);
    service.DeleteAETriage(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
