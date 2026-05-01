import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { SurgeryEntryDetailsService } from '../Service/Index';
// import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddSurgeryEntryDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SurgeryEntryDetailsService, req);
    service.AddSurgeryEntryDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateSurgeryEntryDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SurgeryEntryDetailsService, req);
    service.UpdateSurgeryEntryDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
// router.post('/GetSurgeryEntryDetailsById', (req: Request, res: Response, next: NextFunction): any => {
//     const service = ServiceFactory.CreateService(SurgeryEntryDetailsService, req);
//     service.GetSurgeryEntryDetailsById(req.body)
//         .then((response) => { res.send(response); })
//         .catch(next);
// });
// router.post('/GetSurgeryEntryDetailss', (req: Request, res: Response, next: NextFunction): any => {
//     const service = ServiceFactory.CreateService(SurgeryEntryDetailsService, req);
//     service.GetSurgeryEntryDetailss(req.body)
//         .then((response) => { res.send(response); })
//         .catch(next);
// });
// router.post('/DeleteSurgeryEntryDetails', (req: Request, res: Response, next: NextFunction): any => {
//     const service = ServiceFactory.CreateService(SurgeryEntryDetailsService, req);
//     service.DeleteSurgeryEntryDetails(req.body)
//         .then((response) => { res.send(response); })
//         .catch(next);
// });
// router.post('/PrintSurgeryEntryDetails', (req: Request, res: Response, next: NextFunction): any => {
//     const service = ServiceFactory.CreateService(SurgeryEntryDetailsService, req);
//     service.PrintSurgeryEntryDetails(req.body)
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
// router.post('/PrintSurgeryEntryDetailsreport', (req: Request, res: Response, next: NextFunction): any => {
//     const service = ServiceFactory.CreateService(SurgeryEntryDetailsService, req);
//     service.PrintSurgeryEntryDetailsreport(req.body)
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
