import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AssessmentService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddAssessment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssessmentService, req);
    service.AddAssessment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAssessment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssessmentService, req);
    service.UpdateAssessment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAssessmentById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssessmentService, req);
    service.GetAssessmentById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAssessments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssessmentService, req);
    service.GetAssessments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAssessment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AssessmentService, req);
    service.DeleteAssessment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
