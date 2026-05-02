import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { GeneralExpensesService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddGeneralExpenses', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GeneralExpensesService, req);
    service.AddGeneralExpenses(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateGeneralExpenses', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GeneralExpensesService, req);
    service.UpdateGeneralExpenses(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGeneralExpensesById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GeneralExpensesService, req);
    service.GetGeneralExpensesById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGeneralExpensess', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GeneralExpensesService, req);
    service.GetGeneralExpensess(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteGeneralExpenses', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GeneralExpensesService, req);
    service.DeleteGeneralExpenses(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintGeneralExpenses', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GeneralExpensesService, req);
    service.PrintGeneralExpenses(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintGeneralExpenseList', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GeneralExpensesService, req);
    service.PrintGeneralExpenseList(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
export default router;
