import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PastLabResultService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPastLabResult', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PastLabResultService, req);
    service.AddPastLabResult(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePastLabResult', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PastLabResultService, req);
    service.UpdatePastLabResult(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPastLabResultById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PastLabResultService, req);
    service.GetPastLabResultById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPastLabResults', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PastLabResultService, req);
    service.GetPastLabResults(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePastLabResult', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PastLabResultService, req);
    service.DeletePastLabResult(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
