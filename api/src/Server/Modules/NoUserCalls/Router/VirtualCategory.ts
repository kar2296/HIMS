import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { VirtualCategoryService } from '../../VirtualHealthcare/Service/VirtualCategoryService';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
let router: Router = express.Router();

router.post('/GetVirtualCategorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VirtualCategoryService, req);
    service.GetVirtualCategorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
