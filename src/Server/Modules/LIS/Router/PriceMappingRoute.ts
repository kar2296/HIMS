import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PriceMappingService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPriceMapping', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PriceMappingService, req);
    service.AddPriceMapping(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePriceMapping', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PriceMappingService, req);
    service.UpdatePriceMapping(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPriceMappingById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PriceMappingService, req);
    service.GetPriceMappingById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPriceMappings', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PriceMappingService, req);
    service.GetPriceMappings(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePriceMapping', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PriceMappingService, req);
    service.DeletePriceMapping(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
