import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PreOperativeChecklistService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPreOperativeChecklist', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PreOperativeChecklistService, req);
    service.AddPreOperativeChecklist(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePreOperativeChecklist', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PreOperativeChecklistService, req);
    service.UpdatePreOperativeChecklist(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFeedbackSignPic', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PreOperativeChecklistService, req);
    service.GetFeedbackSignPic(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPreOperativeChecklistById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PreOperativeChecklistService, req);
    service.GetPreOperativeChecklistById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPreOperativeChecklists', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PreOperativeChecklistService, req);
    service.GetPreOperativeChecklists(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePreOperativeChecklist', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PreOperativeChecklistService, req);
    service.DeletePreOperativeChecklist(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
