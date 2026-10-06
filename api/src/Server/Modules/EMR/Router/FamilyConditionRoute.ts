import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { FamilyConditionService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddFamilyCondition', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FamilyConditionService, req);
    service.AddFamilyCondition(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateFamilyCondition', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FamilyConditionService, req);
    service.UpdateFamilyCondition(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFamilyConditionById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FamilyConditionService, req);
    service.GetFamilyConditionById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageFamilyConditions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FamilyConditionService, req);
    service.ManageFamilyConditions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFamilyConditions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FamilyConditionService, req);
    service.GetFamilyConditions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteFamilyCondition', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FamilyConditionService, req);
    service.DeleteFamilyCondition(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
