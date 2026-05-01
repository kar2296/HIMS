import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { BedTransportationService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddBedTransportation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedTransportationService, req);
    service.AddBedTransportation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateBedTransportation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedTransportationService, req);
    service.UpdateBedTransportation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBedTransportationById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedTransportationService, req);
    service.GetBedTransportationById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBedTransportations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedTransportationService, req);
    service.GetBedTransportations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteBedTransportation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedTransportationService, req);
    service.DeleteBedTransportation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
