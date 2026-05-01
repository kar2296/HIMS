import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ClaimSubmissionService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddClaimSubmission', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClaimSubmissionService, req);
    service.AddClaimSubmission(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateClaimSubmission', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClaimSubmissionService, req);
    service.UpdateClaimSubmission(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetClaimSubmissionById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClaimSubmissionService, req);
    service.GetClaimSubmissionById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetClaimSubmissions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClaimSubmissionService, req);
    service.GetClaimSubmissions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintClaimSubmission', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClaimSubmissionService, req);
    service.PrintClaimSubmission(req.body)
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
router.post('/DeleteClaimSubmission', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClaimSubmissionService, req);
    service.DeleteClaimSubmission(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
