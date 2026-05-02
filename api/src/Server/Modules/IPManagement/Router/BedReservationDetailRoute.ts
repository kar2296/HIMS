import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { BedReservationDetailService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddBedReservationDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedReservationDetailService, req);
    service.AddBedReservationDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateBedReservationDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedReservationDetailService, req);
    service.UpdateBedReservationDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBedReservationDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedReservationDetailService, req);
    service.GetBedReservationDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBedReservationDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedReservationDetailService, req);
    service.GetBedReservationDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteBedReservationDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedReservationDetailService, req);
    service.DeleteBedReservationDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
