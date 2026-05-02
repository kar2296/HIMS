import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { BedHousekeepinglogService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddBedHousekeepinglog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedHousekeepinglogService, req);
    service.AddBedHousekeepinglog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateBedHousekeepinglog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedHousekeepinglogService, req);
    service.UpdateBedHousekeepinglog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBedHousekeepinglogById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedHousekeepinglogService, req);
    service.GetBedHousekeepinglogById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBedHousekeepinglogs', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedHousekeepinglogService, req);
    service.GetBedHousekeepinglogs(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteBedHousekeepinglog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedHousekeepinglogService, req);
    service.DeleteBedHousekeepinglog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
