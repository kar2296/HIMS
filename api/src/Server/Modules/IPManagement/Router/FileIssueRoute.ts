import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { FileIssueService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddFileIssue', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FileIssueService, req);
    service.AddFileIssue(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateFileIssue', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FileIssueService, req);
    service.UpdateFileIssue(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFileIssueById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FileIssueService, req);
    service.GetFileIssueById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFileIssues', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FileIssueService, req);
    service.GetFileIssues(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteFileIssue', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FileIssueService, req);
    service.DeleteFileIssue(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
