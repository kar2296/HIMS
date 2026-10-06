import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ClaimSubmissionDetailsService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddClaimSubmissionDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClaimSubmissionDetailsService, req);
    service.AddClaimSubmissionDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateClaimSubmissionDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClaimSubmissionDetailsService, req);
    service.UpdateClaimSubmissionDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetClaimSubmissionDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClaimSubmissionDetailsService, req);
    service.GetClaimSubmissionDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetClaimSubmissionDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClaimSubmissionDetailsService, req);
    service.GetClaimSubmissionDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintGetClaimSubmission', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClaimSubmissionDetailsService, req);
    service.PrintGetClaimSubmission(req.body)
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
router.post('/DeleteClaimSubmissionDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClaimSubmissionDetailsService, req);
    service.DeleteClaimSubmissionDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
