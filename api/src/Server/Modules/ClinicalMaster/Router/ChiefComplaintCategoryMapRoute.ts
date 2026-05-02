import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ChiefComplaintCategoryMapService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddChiefComplaintCategoryMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ChiefComplaintCategoryMapService, req);
    service.AddChiefComplaintCategoryMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateChiefComplaintCategoryMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ChiefComplaintCategoryMapService, req);
    service.UpdateChiefComplaintCategoryMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetChiefComplaintCategoryMapById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ChiefComplaintCategoryMapService, req);
    service.GetChiefComplaintCategoryMapById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetChiefComplaintCategoryMaps', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ChiefComplaintCategoryMapService, req);
    service.GetChiefComplaintCategoryMaps(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteChiefComplaintCategoryMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ChiefComplaintCategoryMapService, req);
    service.DeleteChiefComplaintCategoryMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
