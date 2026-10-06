import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { BedtransportationlogService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddBedtransportationlog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedtransportationlogService, req);
    service.AddBedtransportationlog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateBedtransportationlog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedtransportationlogService, req);
    service.UpdateBedtransportationlog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBedtransportationlogById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedtransportationlogService, req);
    service.GetBedtransportationlogById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBedtransportationlogs', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedtransportationlogService, req);
    service.GetBedtransportationlogs(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteBedtransportationlog', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedtransportationlogService, req);
    service.DeleteBedtransportationlog(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
