import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ProductSubTypeService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddProductSubType', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProductSubTypeService, req);
    service.AddProductSubType(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateProductSubType', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProductSubTypeService, req);
    service.UpdateProductSubType(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProductSubTypeById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProductSubTypeService, req);
    service.GetProductSubTypeById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProductSubTypes', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProductSubTypeService, req);
    service.GetProductSubTypes(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteProductSubType', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProductSubTypeService, req);
    service.DeleteProductSubType(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
