import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { TreatementModalityService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddTreatementModality', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatementModalityService, req);
    service.AddTreatementModality(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateTreatementModality', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatementModalityService, req);
    service.UpdateTreatementModality(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageTreatementModality', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatementModalityService, req);
    service.ManageTreatementModality(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTreatementModalityById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatementModalityService, req);
    service.GetTreatementModalityById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTreatementModalitys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatementModalityService, req);
    service.GetTreatementModalitys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteTreatementModality', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TreatementModalityService, req);
    service.DeleteTreatementModality(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
