import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ClaimCoveringletterService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddClaimCoveringletter', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClaimCoveringletterService, req);
    service.AddClaimCoveringletter(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateClaimCoveringletter', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClaimCoveringletterService, req);
    service.UpdateClaimCoveringletter(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetClaimCoveringletterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClaimCoveringletterService, req);
    service.GetClaimCoveringletterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetClaimCoveringletters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClaimCoveringletterService, req);
    service.GetClaimCoveringletters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteClaimCoveringletter', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClaimCoveringletterService, req);
    service.DeleteClaimCoveringletter(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintClaimCoveringletter', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClaimCoveringletterService, req);
    service.PrintClaimCoveringletter(req.body)
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
