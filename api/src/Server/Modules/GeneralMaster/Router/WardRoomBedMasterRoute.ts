import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { WardRoomBedMasterService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddWardRoomBedMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardRoomBedMasterService, req);
    service.AddWardRoomBedMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateWardRoomBedMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardRoomBedMasterService, req);
    service.UpdateWardRoomBedMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetWardRoomBedMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardRoomBedMasterService, req);
    service.GetWardRoomBedMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetWardRoomBedMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardRoomBedMasterService, req);
    service.GetWardRoomBedMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteWardRoomBedMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardRoomBedMasterService, req);
    service.DeleteWardRoomBedMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBedStatusList', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardRoomBedMasterService, req);
    service.GetBedStatusList(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintWardRoomBedMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardRoomBedMasterService, req);
    service.PrintWardRoomBedMasters(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
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
router.post('/PrintAvailableBedMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardRoomBedMasterService, req);
    service.PrintAvailableBedMasters(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
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
router.post('/PrintCovidStatisticsReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardRoomBedMasterService, req);
    service.PrintCovidStatisticsReport(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
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
