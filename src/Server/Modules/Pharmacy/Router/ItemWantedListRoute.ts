import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ItemWantedListService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddItemWantedList', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemWantedListService, req);
    service.AddItemWantedList(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateItemWantedList', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemWantedListService, req);
    service.UpdateItemWantedList(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemWantedListById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemWantedListService, req);
    service.GetItemWantedListById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemWantedLists', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemWantedListService, req);
    service.GetItemWantedLists(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteItemWantedList', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemWantedListService, req);
    service.DeleteItemWantedList(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintItemWantedReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemWantedListService, req);
    service.PrintItemWantedReport(req.body)
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
