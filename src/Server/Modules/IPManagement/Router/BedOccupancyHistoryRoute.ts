import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { BedOccupancyHistoryService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddBedOccupancyHistory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedOccupancyHistoryService, req);
    service.AddBedOccupancyHistory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateBedOccupancyHistory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedOccupancyHistoryService, req);
    service.UpdateBedOccupancyHistory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageBedOccupancyUpDownTariff', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedOccupancyHistoryService, req);
    service.ManageBedOccupancyUpDownTariff(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBedOccupancyHistoryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedOccupancyHistoryService, req);
    service.GetBedOccupancyHistoryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBedOccupancyHistorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedOccupancyHistoryService, req);
    service.GetBedOccupancyHistorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteBedOccupancyHistory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedOccupancyHistoryService, req);
    service.DeleteBedOccupancyHistory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DischargeAttenderBed', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedOccupancyHistoryService, req);
    service.DischargeAttenderBed(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintBedOccupancyHistorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedOccupancyHistoryService, req);
    service.PrintBedOccupancyHistorys(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
export default router;
