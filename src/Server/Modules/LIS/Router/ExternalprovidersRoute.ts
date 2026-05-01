import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ExternalprovidersService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddExternalproviders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ExternalprovidersService, req);
    service.AddExternalproviders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateExternalproviders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ExternalprovidersService, req);
    service.UpdateExternalproviders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetExternalprovidersById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ExternalprovidersService, req);
    service.GetExternalprovidersById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetExternalproviders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ExternalprovidersService, req);
    service.GetExternalproviders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteExternalproviders', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ExternalprovidersService, req);
    service.DeleteExternalproviders(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
