import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PreOperativeChecklistDetailsService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPreOperativeChecklistDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PreOperativeChecklistDetailsService, req);
    service.AddPreOperativeChecklistDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePreOperativeChecklistDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PreOperativeChecklistDetailsService, req);
    service.UpdatePreOperativeChecklistDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPreOperativeChecklistDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PreOperativeChecklistDetailsService, req);
    service.GetPreOperativeChecklistDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManagePreOperativeChecklistDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PreOperativeChecklistDetailsService, req);
    service.ManagePreOperativeChecklistDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPreOperativeChecklistDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PreOperativeChecklistDetailsService, req);
    service.GetPreOperativeChecklistDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePreOperativeChecklistDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PreOperativeChecklistDetailsService, req);
    service.DeletePreOperativeChecklistDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
