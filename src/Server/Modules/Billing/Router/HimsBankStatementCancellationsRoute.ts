import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { BankStatementCancellationsService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddBankStatementCancellations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BankStatementCancellationsService, req);
    service.AddBankStatementCancellations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateBankStatementCancellations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BankStatementCancellationsService, req);
    service.UpdateBankStatementCancellations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBankStatementCancellationsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BankStatementCancellationsService, req);
    service.GetBankStatementCancellationsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBankStatementCancellations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BankStatementCancellationsService, req);
    service.GetBankStatementCancellations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteBankStatementCancellations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BankStatementCancellationsService, req);
    service.DeleteBankStatementCancellations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
