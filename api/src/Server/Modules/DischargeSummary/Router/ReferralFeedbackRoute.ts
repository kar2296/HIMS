import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ReferralFeedbackService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddReferralFeedback', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferralFeedbackService, req);
    service.AddReferralFeedback(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateReferralFeedback', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferralFeedbackService, req);
    service.UpdateReferralFeedback(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetReferralFeedbackById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferralFeedbackService, req);
    service.GetReferralFeedbackById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetReferralFeedbacks', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferralFeedbackService, req);
    service.GetReferralFeedbacks(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteReferralFeedback', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferralFeedbackService, req);
    service.DeleteReferralFeedback(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintReferralFeedback', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ReferralFeedbackService, req);
    service.PrintReferralFeedback(req.body)
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
