import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ProductTypeService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddProductType', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProductTypeService, req);
    service.AddProductType(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateProductType', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProductTypeService, req);
    service.UpdateProductType(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProductTypeById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProductTypeService, req);
    service.GetProductTypeById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetProductTypes', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProductTypeService, req);
    service.GetProductTypes(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintProductTypeReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProductTypeService, req);
    service.PrintProductTypeReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/DeleteProductType', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ProductTypeService, req);
    service.DeleteProductType(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
