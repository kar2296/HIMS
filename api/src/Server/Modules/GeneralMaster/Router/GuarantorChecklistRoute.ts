import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { GuarantorChecklistService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddGuarantorChecklist', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorChecklistService, req);
    service.AddGuarantorChecklist(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateGuarantorChecklist', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorChecklistService, req);
    service.UpdateGuarantorChecklist(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageGuarantorChecklist', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorChecklistService, req);
    service.ManageGuarantorChecklist(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGuarantorChecklistById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorChecklistService, req);
    service.GetGuarantorChecklistById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGuarantorChecklists', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorChecklistService, req);
    service.GetGuarantorChecklists(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteGuarantorChecklist', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorChecklistService, req);
    service.DeleteGuarantorChecklist(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
