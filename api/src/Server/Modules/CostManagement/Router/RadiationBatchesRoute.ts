import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { RadiationBatchesService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddRadiationBatches', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RadiationBatchesService, req);
    service.AddRadiationBatches(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateRadiationBatches', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RadiationBatchesService, req);
    service.UpdateRadiationBatches(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRadiationBatchesById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RadiationBatchesService, req);
    service.GetRadiationBatchesById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteRadiationBatches', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RadiationBatchesService, req);
    service.DeleteRadiationBatches(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
