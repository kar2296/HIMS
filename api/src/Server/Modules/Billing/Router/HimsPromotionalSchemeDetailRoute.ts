import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PromotionalSchemeDetailService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPromotionalSchemeDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PromotionalSchemeDetailService, req);
    service.AddPromotionalSchemeDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePromotionalSchemeDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PromotionalSchemeDetailService, req);
    service.UpdatePromotionalSchemeDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPromotionalSchemeDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PromotionalSchemeDetailService, req);
    service.GetPromotionalSchemeDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPromotionalSchemeDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PromotionalSchemeDetailService, req);
    service.GetPromotionalSchemeDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePromotionalSchemeDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PromotionalSchemeDetailService, req);
    service.DeletePromotionalSchemeDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
