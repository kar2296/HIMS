import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { CarePathPrescriptionService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddCarePathPrescription', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathPrescriptionService, req);
    service.AddCarePathPrescription(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCarePathPrescription', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathPrescriptionService, req);
    service.UpdateCarePathPrescription(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCarePathPrescriptionById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathPrescriptionService, req);
    service.GetCarePathPrescriptionById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCarePathPrescriptions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathPrescriptionService, req);
    service.GetCarePathPrescriptions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteCarePathPrescription', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathPrescriptionService, req);
    service.DeleteCarePathPrescription(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
