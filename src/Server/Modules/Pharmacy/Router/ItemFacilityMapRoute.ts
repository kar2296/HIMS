import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ItemFacilityMapService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddItemFacilityMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemFacilityMapService, req);
    service.AddItemFacilityMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateItemFacilityMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemFacilityMapService, req);
    service.UpdateItemFacilityMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemFacilityMapById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemFacilityMapService, req);
    service.GetItemFacilityMapById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemFacilityMaps', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemFacilityMapService, req);
    service.GetItemFacilityMaps(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFacilityMasterItem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemFacilityMapService, req);
    service.GetFacilityMasterItem(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteItemFacilityMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemFacilityMapService, req);
    service.DeleteItemFacilityMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
