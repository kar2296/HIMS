import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { QMSService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddQMS', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(QMSService, req);
    service.AddQMS(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/createTokenForOldPatient', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(QMSService, req);
    service.createTokenForOldPatient(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateQMS', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(QMSService, req);
    service.UpdateQMS(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLastTokenCount', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(QMSService, req);
    service.GetLastTokenCount(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetQMSById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(QMSService, req);
    service.GetQMSById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetQMS', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(QMSService, req);
    service.GetQMS(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteQMS', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(QMSService, req);
    service.DeleteQMS(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
