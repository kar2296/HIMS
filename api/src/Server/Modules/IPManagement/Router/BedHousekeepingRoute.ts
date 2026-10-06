import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { BedHousekeepingService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddBedHousekeeping', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedHousekeepingService, req);
    service.AddBedHousekeeping(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateBedHousekeeping', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedHousekeepingService, req);
    service.UpdateBedHousekeeping(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBedHousekeepingById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedHousekeepingService, req);
    service.GetBedHousekeepingById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBedHousekeepings', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedHousekeepingService, req);
    service.GetBedHousekeepings(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteBedHousekeeping', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedHousekeepingService, req);
    service.DeleteBedHousekeeping(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
