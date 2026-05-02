import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { BudgetService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddBudget', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BudgetService, req);
    service.AddBudget(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateBudget', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BudgetService, req);
    service.UpdateBudget(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBudgetById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BudgetService, req);
    service.GetBudgetById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBudgets', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BudgetService, req);
    service.GetBudgets(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteBudget', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BudgetService, req);
    service.DeleteBudget(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
