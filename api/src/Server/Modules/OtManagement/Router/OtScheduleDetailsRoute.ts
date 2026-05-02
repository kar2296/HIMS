import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { OtScheduleDetailsService } from '../Service/Index';
// import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddOtScheduleDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtScheduleDetailsService, req);
    service.AddOtScheduleDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateOtScheduleDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtScheduleDetailsService, req);
    service.UpdateOtScheduleDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
// router.post('/GetOtScheduleDetailsById', (req: Request, res: Response, next: NextFunction): any => {
//     const service = ServiceFactory.CreateService(OtScheduleDetailsService, req);
//     service.GetOtScheduleDetailsById(req.body)
//         .then((response) => { res.send(response); })
//         .catch(next);
// });
// router.post('/GetOtScheduleDetailss', (req: Request, res: Response, next: NextFunction): any => {
//     const service = ServiceFactory.CreateService(OtScheduleDetailsService, req);
//     service.GetOtScheduleDetailss(req.body)
//         .then((response) => { res.send(response); })
//         .catch(next);
// });
// router.post('/DeleteOtScheduleDetails', (req: Request, res: Response, next: NextFunction): any => {
//     const service = ServiceFactory.CreateService(OtScheduleDetailsService, req);
//     service.DeleteOtScheduleDetails(req.body)
//         .then((response) => { res.send(response); })
//         .catch(next);
// });
// router.post('/PrintOtScheduleDetails', (req: Request, res: Response, next: NextFunction): any => {
//     const service = ServiceFactory.CreateService(OtScheduleDetailsService, req);
//     service.PrintOtScheduleDetails(req.body)
//         .then((response) => {
//             if (!req.transaction.finished) {
//                 req.transaction.commit();
//             }
//             res.download(response.filename, (err) => {
//                 if (response) {
//                     unlinkSync(response.filename);
//                 }
//                 if (err) {
//                     return next(err);
//                 }
//             });
//         })
//         .catch(next);
// });
// router.post('/PrintOtScheduleDetailsreport', (req: Request, res: Response, next: NextFunction): any => {
//     const service = ServiceFactory.CreateService(OtScheduleDetailsService, req);
//     service.PrintOtScheduleDetailsreport(req.body)
//         .then((response) => {
//             if (!req.transaction.finished) {
//                 req.transaction.commit();
//             }
//             res.download(response.filename, (err) => {
//                 if (response) {
//                     unlinkSync(response.filename);
//                 }
//                 if (err) {
//                     return next(err);
//                 }
//             });
//         })
//         .catch(next);
// });
export default router;
