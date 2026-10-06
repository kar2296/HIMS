import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PromotionalSchemeService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPromotionalScheme', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PromotionalSchemeService, req);
    service.AddPromotionalScheme(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePromotionalScheme', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PromotionalSchemeService, req);
    service.UpdatePromotionalScheme(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPromotionalSchemeById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PromotionalSchemeService, req);
    service.GetPromotionalSchemeById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPromotionalSchemes', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PromotionalSchemeService, req);
    service.GetPromotionalSchemes(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPromotionalSchemesWithoutDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PromotionalSchemeService, req);
    service.GetPromotionalSchemesWithoutDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePromotionalScheme', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PromotionalSchemeService, req);
    service.DeletePromotionalScheme(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
