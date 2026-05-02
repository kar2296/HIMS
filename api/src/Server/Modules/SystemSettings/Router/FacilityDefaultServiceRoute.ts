import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { FacilityDefaultServiceService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddFacilityDefaultService', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityDefaultServiceService, req);
    service.AddFacilityDefaultService(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateFacilityDefaultService', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityDefaultServiceService, req);
    service.UpdateFacilityDefaultService(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageFacilityDefaultService', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityDefaultServiceService, req);
    service.ManageFacilityDefaultService(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFacilityDefaultServiceById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityDefaultServiceService, req);
    service.GetFacilityDefaultServiceById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFacilityDefaultServices', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityDefaultServiceService, req);
    service.GetFacilityDefaultServices(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteFacilityDefaultService', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityDefaultServiceService, req);
    service.DeleteFacilityDefaultService(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
