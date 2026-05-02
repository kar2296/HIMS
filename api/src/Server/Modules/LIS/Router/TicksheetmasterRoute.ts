import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { TicksheetmasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddTicksheetmaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TicksheetmasterService, req);
    service.AddTicksheetmaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateTicksheetmaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TicksheetmasterService, req);
    service.UpdateTicksheetmaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTicksheetmasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TicksheetmasterService, req);
    service.GetTicksheetmasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTicksheetmasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TicksheetmasterService, req);
    service.GetTicksheetmasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteTicksheetmaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TicksheetmasterService, req);
    service.DeleteTicksheetmaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
