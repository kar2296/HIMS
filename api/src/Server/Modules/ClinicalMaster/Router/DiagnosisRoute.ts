import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DiagnosisService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddDiagnosis', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DiagnosisService, req);
    service.AddDiagnosis(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDiagnosis', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DiagnosisService, req);
    service.UpdateDiagnosis(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDiagnosisById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DiagnosisService, req);
    service.GetDiagnosisById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDiagnosiss', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DiagnosisService, req);
    service.GetDiagnosiss(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteDiagnosis', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DiagnosisService, req);
    service.DeleteDiagnosis(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSNOMEDCT', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DiagnosisService, req);
    service.GetSNOMEDCT(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSNOMEDCTByConceptId', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DiagnosisService, req);
    service.GetSNOMEDCTByConceptId(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
