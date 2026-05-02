import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ClinicalFindingService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddClinicalFinding', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClinicalFindingService, req);
    service.AddClinicalFinding(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateClinicalFinding', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClinicalFindingService, req);
    service.UpdateClinicalFinding(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetClinicalFindingById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClinicalFindingService, req);
    service.GetClinicalFindingById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetClinicalFindings', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClinicalFindingService, req);
    service.GetClinicalFindings(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteClinicalFinding', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClinicalFindingService, req);
    service.DeleteClinicalFinding(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
