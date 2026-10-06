import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { BankStatementDetailsService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddBankStatementDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BankStatementDetailsService, req);
    service.AddBankStatementDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateBankStatementDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BankStatementDetailsService, req);
    service.UpdateBankStatementDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBankStatementDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BankStatementDetailsService, req);
    service.GetBankStatementDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBankStatementDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BankStatementDetailsService, req);
    service.GetBankStatementDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteBankStatementDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BankStatementDetailsService, req);
    service.DeleteBankStatementDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
