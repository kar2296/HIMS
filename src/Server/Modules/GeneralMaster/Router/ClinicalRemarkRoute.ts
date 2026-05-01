import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ClinicalRemarkService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddClinicalRemark', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClinicalRemarkService, req);
    service.AddClinicalRemark(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateClinicalRemark', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClinicalRemarkService, req);
    service.UpdateClinicalRemark(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetClinicalRemarkById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClinicalRemarkService, req);
    service.GetClinicalRemarkById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetClinicalRemarks', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClinicalRemarkService, req);
    service.GetClinicalRemarks(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteClinicalRemark', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClinicalRemarkService, req);
    service.DeleteClinicalRemark(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
