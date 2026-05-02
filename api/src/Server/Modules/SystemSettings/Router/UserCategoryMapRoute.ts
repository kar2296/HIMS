import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { UserCategoryMapService } from '../Service/Index';

let router: Router = express.Router();

router.post('/GetUserCategoryMaps', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserCategoryMapService, req);
    service.GetUserCategoryMaps(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
