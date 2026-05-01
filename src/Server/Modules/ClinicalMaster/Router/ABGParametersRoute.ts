import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ABGParametersService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddABGParameters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ABGParametersService, req);
    service.AddABGParameters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateABGParameters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ABGParametersService, req);
    service.UpdateABGParameters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetABGParametersById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ABGParametersService, req);
    service.GetABGParametersById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetABGParameterss', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ABGParametersService, req);
    service.GetABGParameterss(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteABGParameters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ABGParametersService, req);
    service.DeleteABGParameters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
