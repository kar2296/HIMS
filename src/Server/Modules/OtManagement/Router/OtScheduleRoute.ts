import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { OtScheduleService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddOtSchedule', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtScheduleService, req);
    service.AddOtSchedule(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateOtSchedule', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtScheduleService, req);
    service.UpdateOtSchedule(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOtScheduleById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtScheduleService, req);
    service.GetOtScheduleById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCathlabScheduleById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtScheduleService, req);
    service.GetCathlabScheduleById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOtSchedules', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtScheduleService, req);
    service.GetOtSchedules(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCathlabSchedule', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtScheduleService, req);
    service.GetCathlabSchedule(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteOtSchedule', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtScheduleService, req);
    service.DeleteOtSchedule(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintOtSchedule', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtScheduleService, req);
    service.PrintOtSchedule(req.body)
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
router.post('/PrintOtSchedulereport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtScheduleService, req);
    service.PrintOtSchedulereport(req.body)
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
