import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { IPFileRequestService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddIPFileRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPFileRequestService, req);
    service.AddIPFileRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateIPFileRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPFileRequestService, req);
    service.UpdateIPFileRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIPFileRequestById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPFileRequestService, req);
    service.GetIPFileRequestById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIPFileRequests', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPFileRequestService, req);
    service.GetIPFileRequests(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteIPFileRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPFileRequestService, req);
    service.DeleteIPFileRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintNotifyIncompleteFileReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IPFileRequestService, req);
    service.PrintNotifyIncompleteFileReport(req.body)
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
