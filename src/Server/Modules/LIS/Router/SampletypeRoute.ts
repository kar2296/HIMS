import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { SampletypeService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddSampletype', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SampletypeService, req);
    service.AddSampletype(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateSampletype', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SampletypeService, req);
    service.UpdateSampletype(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSampletypeById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SampletypeService, req);
    service.GetSampletypeById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSampletypes', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SampletypeService, req);
    service.GetSampletypes(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteSampletype', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SampletypeService, req);
    service.DeleteSampletype(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
