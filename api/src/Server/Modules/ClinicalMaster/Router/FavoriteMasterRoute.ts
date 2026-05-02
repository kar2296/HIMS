import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { FavoriteMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddFavoriteMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FavoriteMasterService, req);
    service.AddFavoriteMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateFavoriteMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FavoriteMasterService, req);
    service.UpdateFavoriteMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFavoriteMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FavoriteMasterService, req);
    service.GetFavoriteMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFavoriteMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FavoriteMasterService, req);
    service.GetFavoriteMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteFavoriteMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FavoriteMasterService, req);
    service.DeleteFavoriteMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
