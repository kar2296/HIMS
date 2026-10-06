import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { FileRequestService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddFileRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FileRequestService, req);
    service.AddFileRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateFileRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FileRequestService, req);
    service.UpdateFileRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageFileRequestFromApptReq', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FileRequestService, req);
    service.ManageFileRequestFromApptReq(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFileRequestById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FileRequestService, req);
    service.GetFileRequestById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFileRequests', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FileRequestService, req);
    service.GetFileRequests(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteFileRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FileRequestService, req);
    service.DeleteFileRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
