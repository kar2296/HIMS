import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ReferenceValueService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddReferenceValue', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferenceValueService, req);
    service.AddReferenceValue(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateReferenceValue', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferenceValueService, req);
    service.UpdateReferenceValue(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetReferenceValueById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferenceValueService, req);
    service.GetReferenceValueById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetReferenceValues', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferenceValueService, req);
    service.GetReferenceValues(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteReferenceValue', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferenceValueService, req);
    service.DeleteReferenceValue(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
