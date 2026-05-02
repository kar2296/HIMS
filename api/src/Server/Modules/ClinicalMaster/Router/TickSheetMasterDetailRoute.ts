import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { TickSheetMasterDetailService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddTickSheetMasterDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TickSheetMasterDetailService, req);
    service.AddTickSheetMasterDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateTickSheetMasterDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TickSheetMasterDetailService, req);
    service.UpdateTickSheetMasterDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTickSheetMasterDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TickSheetMasterDetailService, req);
    service.GetTickSheetMasterDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTickSheetMasterDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TickSheetMasterDetailService, req);
    service.GetTickSheetMasterDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteTickSheetMasterDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TickSheetMasterDetailService, req);
    service.DeleteTickSheetMasterDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
