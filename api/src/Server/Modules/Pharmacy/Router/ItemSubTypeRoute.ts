import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ItemSubTypeService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddItemSubType', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemSubTypeService, req);
    service.AddItemSubType(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateItemSubType', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemSubTypeService, req);
    service.UpdateItemSubType(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemSubTypeById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemSubTypeService, req);
    service.GetItemSubTypeById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemSubTypes', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemSubTypeService, req);
    service.GetItemSubTypes(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteItemSubType', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemSubTypeService, req);
    service.DeleteItemSubType(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
