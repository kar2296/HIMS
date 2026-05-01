import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { WardMasterService } from '../Service/Index';
import { unlinkSync } from 'fs';


let router: Router = express.Router();

router.post('/AddWardMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardMasterService, req);
    service.AddWardMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateWardMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardMasterService, req);
    service.UpdateWardMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetWardMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardMasterService, req);
    service.GetWardMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetWardMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardMasterService, req);
    service.GetWardMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetWardBeds', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardMasterService, req);
    service.GetWardBeds(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteWardMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardMasterService, req);
    service.DeleteWardMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetWardInfoDashBoard', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardMasterService, req);
    service.GetWardInfoDashBoard(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintIPOccupanyWardReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardMasterService, req);
    service.PrintIPOccupanyWardReport(req.body)
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
