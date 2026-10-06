import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { TickSheetMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddTickSheetMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TickSheetMasterService, req);
    service.AddTickSheetMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateTickSheetMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TickSheetMasterService, req);
    service.UpdateTickSheetMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTickSheetMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TickSheetMasterService, req);
    service.GetTickSheetMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTickSheetMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TickSheetMasterService, req);
    service.GetTickSheetMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteTickSheetMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TickSheetMasterService, req);
    service.DeleteTickSheetMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
