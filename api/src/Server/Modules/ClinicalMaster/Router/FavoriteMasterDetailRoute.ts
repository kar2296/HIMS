import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { FavoriteMasterDetailService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddFavoriteMasterDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FavoriteMasterDetailService, req);
    service.AddFavoriteMasterDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateFavoriteMasterDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FavoriteMasterDetailService, req);
    service.UpdateFavoriteMasterDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFavoriteMasterDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FavoriteMasterDetailService, req);
    service.GetFavoriteMasterDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFavoriteMasterDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FavoriteMasterDetailService, req);
    service.GetFavoriteMasterDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteFavoriteMasterDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FavoriteMasterDetailService, req);
    service.DeleteFavoriteMasterDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
