import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { InvestigationSettingsService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddInvestigationSettings', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InvestigationSettingsService, req);
    service.AddInvestigationSettings(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateInvestigationSettings', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InvestigationSettingsService, req);
    service.UpdateInvestigationSettings(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetInvestigationSettingsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InvestigationSettingsService, req);
    service.GetInvestigationSettingsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetInvestigationSettings', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InvestigationSettingsService, req);
    service.GetInvestigationSettings(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteInvestigationSettings', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(InvestigationSettingsService, req);
    service.DeleteInvestigationSettings(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
