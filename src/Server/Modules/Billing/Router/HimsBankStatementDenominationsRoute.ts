import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { BankStatementDenominationsService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddBankStatementDenominations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BankStatementDenominationsService, req);
    service.AddBankStatementDenominations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateBankStatementDenominations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BankStatementDenominationsService, req);
    service.UpdateBankStatementDenominations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBankStatementDenominationsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BankStatementDenominationsService, req);
    service.GetBankStatementDenominationsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBankStatementDenominations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BankStatementDenominationsService, req);
    service.GetBankStatementDenominations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteBankStatementDenominations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BankStatementDenominationsService, req);
    service.DeleteBankStatementDenominations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
