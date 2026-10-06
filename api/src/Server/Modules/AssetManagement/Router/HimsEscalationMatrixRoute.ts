import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { EscalationMatrixService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddEscalationMatrix', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EscalationMatrixService, req);
    service.AddEscalationMatrix(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateEscalationMatrix', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EscalationMatrixService, req);
    service.UpdateEscalationMatrix(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageEscalationMatrix', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EscalationMatrixService, req);
    service.ManageEscalationMatrix(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEscalationMatrixById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EscalationMatrixService, req);
    service.GetEscalationMatrixById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEscalationMatrixs', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EscalationMatrixService, req);
    service.GetEscalationMatrixs(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/DeleteEscalationMatrix', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EscalationMatrixService, req);
    service.DeleteEscalationMatrix(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
