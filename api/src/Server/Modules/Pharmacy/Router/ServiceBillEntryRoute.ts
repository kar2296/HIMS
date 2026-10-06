import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ServiceBillEntryService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddServiceBillEntry', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceBillEntryService, req);
    service.AddServiceBillEntry(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateServiceBillEntry', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceBillEntryService, req);
    service.UpdateServiceBillEntry(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceBillEntryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceBillEntryService, req);
    service.GetServiceBillEntryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceBillEntrys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceBillEntryService, req);
    service.GetServiceBillEntrys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteServiceBillEntry', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceBillEntryService, req);
    service.DeleteServiceBillEntry(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintWagesServices', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceBillEntryService, req);
    service.PrintWagesServices(req.body)
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
