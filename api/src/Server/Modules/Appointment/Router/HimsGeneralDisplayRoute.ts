import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { GeneralDisplayService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddGeneralDisplay', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GeneralDisplayService, req);
    service.AddGeneralDisplay(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateGeneralDisplay', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GeneralDisplayService, req);
    service.UpdateGeneralDisplay(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGeneralDisplayById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GeneralDisplayService, req);
    service.GetGeneralDisplayById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetListofContents', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GeneralDisplayService, req);
    service.GetListofContents(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGeneralDisplays', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GeneralDisplayService, req);
    service.GetGeneralDisplays(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteGeneralDisplay', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GeneralDisplayService, req);
    service.DeleteGeneralDisplay(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
