import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientCommentService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientComment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCommentService, req);
    service.AddPatientComment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientComment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCommentService, req);
    service.UpdatePatientComment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientCommentById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCommentService, req);
    service.GetPatientCommentById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientComments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCommentService, req);
    service.GetPatientComments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientComment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientCommentService, req);
    service.DeletePatientComment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
