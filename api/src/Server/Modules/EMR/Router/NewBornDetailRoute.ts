import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { NewBornDetailService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddNewBornDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(NewBornDetailService, req);
    service.AddNewBornDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateNewBornDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(NewBornDetailService, req);
    service.UpdateNewBornDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetNewBornDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(NewBornDetailService, req);
    service.GetNewBornDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetNewBornDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(NewBornDetailService, req);
    service.GetNewBornDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteNewBornDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(NewBornDetailService, req);
    service.DeleteNewBornDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/PrintNewBornDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(NewBornDetailService, req);
    service.PrintNewBornDetail(req.body)
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
export default router;
