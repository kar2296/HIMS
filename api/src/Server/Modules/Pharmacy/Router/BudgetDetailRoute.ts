import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { BudgetDetailService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddBudgetDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BudgetDetailService, req);
    service.AddBudgetDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateBudgetDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BudgetDetailService, req);
    service.UpdateBudgetDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBudgetDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BudgetDetailService, req);
    service.GetBudgetDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBudgetDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BudgetDetailService, req);
    service.GetBudgetDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteBudgetDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BudgetDetailService, req);
    service.DeleteBudgetDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
