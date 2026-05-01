import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { SpecialityService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddSpeciality', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SpecialityService, req);
    service.AddSpeciality(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateSpeciality', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SpecialityService, req);
    service.UpdateSpeciality(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSpecialityById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SpecialityService, req);
    service.GetSpecialityById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSpecialitys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SpecialityService, req);
    service.GetSpecialitys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteSpeciality', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SpecialityService, req);
    service.DeleteSpeciality(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
