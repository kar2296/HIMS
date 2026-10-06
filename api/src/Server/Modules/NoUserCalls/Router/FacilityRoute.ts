import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { FacilityService } from '../../SystemSettings/Service/Index';
import { UserService } from '../../SystemSettings/Service/Index';

let router: Router = express.Router();

router.post('/GetOtherFacilitys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityService, req);
    service.GetOtherFacilitys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/GetFacilities', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    // service.GetFacilitiesAuthNull(req.body)
    //     .then((response) => { res.send(response); })
    //     .catch(next);
    service.GetFacilities(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
