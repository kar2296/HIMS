import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { IndicationService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddIndication', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IndicationService, req);
    service.AddIndication(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateIndication', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IndicationService, req);
    service.UpdateIndication(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIndicationById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IndicationService, req);
    service.GetIndicationById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIndications', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IndicationService, req);
    service.GetIndications(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteIndication', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IndicationService, req);
    service.DeleteIndication(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
