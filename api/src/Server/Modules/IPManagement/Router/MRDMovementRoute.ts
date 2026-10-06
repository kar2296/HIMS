import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { MRDMovementService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddMRDMovement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MRDMovementService, req);
    service.AddMRDMovement(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateMRDMovement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MRDMovementService, req);
    service.UpdateMRDMovement(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMRDMovementById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MRDMovementService, req);
    service.GetMRDMovementById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMRDMovements', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MRDMovementService, req);
    service.GetMRDMovements(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteMRDMovement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MRDMovementService, req);
    service.DeleteMRDMovement(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
