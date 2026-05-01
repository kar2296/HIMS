import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { VirtualSubCategoryService } from '../../VirtualHealthcare/Service/VirtualSubCategoryService';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
let router: Router = express.Router();

router.post('/GetVirtualSubCategorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualSubCategoryService, req);
    service.GetVirtualSubCategorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});


router.post('/GetVirtualSubCategoryImage', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualSubCategoryService, req);
    service.GetVirtualSubCategoryImage(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
