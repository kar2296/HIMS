import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ShoulderAssessmentService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddShoulderAssessment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ShoulderAssessmentService, req);
    service.AddShoulderAssessment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateShoulderAssessment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ShoulderAssessmentService, req);
    service.UpdateShoulderAssessment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetShoulderAssessmentById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ShoulderAssessmentService, req);
    service.GetShoulderAssessmentById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetShoulderAssessments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ShoulderAssessmentService, req);
    service.GetShoulderAssessments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteShoulderAssessment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ShoulderAssessmentService, req);
    service.DeleteShoulderAssessment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/PrintOrthoAssessment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ShoulderAssessmentService, req);
    service.PrintOrthoAssessment(req.body)
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
