import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { TermService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddTerm', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TermService, req);
    service.AddTerm(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateTerm', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TermService, req);
    service.UpdateTerm(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTermById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TermService, req);
    service.GetTermById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTerms', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TermService, req);
    service.GetTerms(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteTerm', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TermService, req);
    service.DeleteTerm(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
