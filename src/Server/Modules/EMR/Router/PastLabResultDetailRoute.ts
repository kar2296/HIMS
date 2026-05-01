import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PastLabResultDetailService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPastLabResultDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PastLabResultDetailService, req);
    service.AddPastLabResultDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePastLabResultDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PastLabResultDetailService, req);
    service.UpdatePastLabResultDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPastLabResultDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PastLabResultDetailService, req);
    service.GetPastLabResultDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPastLabResultDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PastLabResultDetailService, req);
    service.GetPastLabResultDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePastLabResultDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PastLabResultDetailService, req);
    service.DeletePastLabResultDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
