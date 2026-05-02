import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ScreenService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddScreen', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ScreenService, req);
    service.AddScreen(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateScreen', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ScreenService, req);
    service.UpdateScreen(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetScreenById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ScreenService, req);
    service.GetScreenById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetScreens', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ScreenService, req);
    service.GetScreens(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteScreen', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ScreenService, req);
    service.DeleteScreen(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
