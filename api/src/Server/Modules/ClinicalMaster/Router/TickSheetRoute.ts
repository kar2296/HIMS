import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { TickSheetService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddTickSheet', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TickSheetService, req);
    service.AddTickSheet(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateTickSheet', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TickSheetService, req);
    service.UpdateTickSheet(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTickSheetById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TickSheetService, req);
    service.GetTickSheetById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTickSheets', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TickSheetService, req);
    service.GetTickSheets(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteTickSheet', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TickSheetService, req);
    service.DeleteTickSheet(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
