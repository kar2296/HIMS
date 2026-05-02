import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientMergeService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientMerge',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientMergeService, req);
        service.AddPatientMerge(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdatePatientMerge',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientMergeService, req);
        service.UpdatePatientMerge(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });

router.post('/GetPatientMergeProfilePic', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientMergeService, req);
    service.GetPatientMergeProfilePic(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientMergeById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientMergeService, req);
    service.GetPatientMergeById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientMerge', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientMergeService, req);
    service.GetPatientMerge(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientMerge', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientMergeService, req);
    service.DeletePatientMerge(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/ManagePatientMerge',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientMergeService, req);
        service.ManagePatientMerge(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
});
router.post('/ManagePatientUnMerge',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PatientMergeService, req);
        service.ManagePatientUnMerge(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
});
export default router;
