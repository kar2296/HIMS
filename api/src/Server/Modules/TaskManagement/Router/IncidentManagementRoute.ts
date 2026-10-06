import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { IncidentManagementService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddIncidentManagement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IncidentManagementService, req);
    service.AddIncidentManagement(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateIncidentManagement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IncidentManagementService, req);
    service.UpdateIncidentManagement(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIncidentManagementById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IncidentManagementService, req);
    service.GetIncidentManagementById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMaxId', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IncidentManagementService, req);
    service.GetMaxId(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIncidentManagements', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IncidentManagementService, req);
    service.GetIncidentManagements(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteIncidentManagement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IncidentManagementService, req);
    service.DeleteIncidentManagement(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
