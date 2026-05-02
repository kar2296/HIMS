import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { BankStatementsService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddBankStatements', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BankStatementsService, req);
    service.AddBankStatements(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateBankStatements', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BankStatementsService, req);
    service.UpdateBankStatements(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DatesAlreadyExist', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BankStatementsService, req);
    service.DatesAlreadyExist(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBankStatementsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BankStatementsService, req);
    service.GetBankStatementsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBankStatements', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BankStatementsService, req);
    service.GetBankStatements(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBankStatementWithoutDenominations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BankStatementsService, req);
    service.GetBankStatementWithoutDenominations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBillingCounters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BankStatementsService, req);
    service.GetBillingCounters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintUpdateBankStatements', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BankStatementsService, req);
    service.PrintUpdateBankStatements(req.body)
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
