import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StoreApprovalMatrixService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddStoreApprovalMatrix', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreApprovalMatrixService, req);
    service.AddStoreApprovalMatrix(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStoreApprovalMatrix', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreApprovalMatrixService, req);
    service.UpdateStoreApprovalMatrix(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStoreApprovalMatrixById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreApprovalMatrixService, req);
    service.GetStoreApprovalMatrixById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStoreApprovalMatrix', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreApprovalMatrixService, req);
    service.GetStoreApprovalMatrix(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStoreApprovalMatrix', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StoreApprovalMatrixService, req);
    service.DeleteStoreApprovalMatrix(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
