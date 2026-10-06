import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { CarePathAssessmentService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddCarePathAssessment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathAssessmentService, req);
    service.AddCarePathAssessment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCarePathAssessment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathAssessmentService, req);
    service.UpdateCarePathAssessment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCarePathAssessmentById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathAssessmentService, req);
    service.GetCarePathAssessmentById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCarePathAssessments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathAssessmentService, req);
    service.GetCarePathAssessments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteCarePathAssessment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathAssessmentService, req);
    service.DeleteCarePathAssessment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
