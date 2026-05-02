import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { OpticalStockMovementService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddOpticalStockMovement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalStockMovementService, req);
    service.AddOpticalStockMovement(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateOpticalStockMovement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalStockMovementService, req);
    service.UpdateOpticalStockMovement(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOpticalStockMovementById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalStockMovementService, req);
    service.GetOpticalStockMovementById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOpticalStockMovements', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalStockMovementService, req);
    service.GetOpticalStockMovements(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteOpticalStockMovement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalStockMovementService, req);
    service.DeleteOpticalStockMovement(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
