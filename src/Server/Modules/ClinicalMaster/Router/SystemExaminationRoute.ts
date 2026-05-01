import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { SystemExaminationService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddSystemExamination', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SystemExaminationService, req);
    service.AddSystemExamination(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateSystemExamination', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SystemExaminationService, req);
    service.UpdateSystemExamination(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSystemExaminationById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SystemExaminationService, req);
    service.GetSystemExaminationById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSystemExaminations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SystemExaminationService, req);
    service.GetSystemExaminations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteSystemExamination', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SystemExaminationService, req);
    service.DeleteSystemExamination(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
