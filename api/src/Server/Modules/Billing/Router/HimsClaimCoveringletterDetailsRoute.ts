import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ClaimCoveringletterDetailsService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddClaimCoveringletterDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClaimCoveringletterDetailsService, req);
    service.AddClaimCoveringletterDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateClaimCoveringletterDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClaimCoveringletterDetailsService, req);
    service.UpdateClaimCoveringletterDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetClaimCoveringletterDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClaimCoveringletterDetailsService, req);
    service.GetClaimCoveringletterDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetClaimCoveringletterDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClaimCoveringletterDetailsService, req);
    service.GetClaimCoveringletterDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteClaimCoveringletterDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClaimCoveringletterDetailsService, req);
    service.DeleteClaimCoveringletterDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
