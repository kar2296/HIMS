import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DrugAlertService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddDrugAlert', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrugAlertService, req);
    service.AddDrugAlert(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDrugAlert', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrugAlertService, req);
    service.UpdateDrugAlert(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDrugAlertById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrugAlertService, req);
    service.GetDrugAlertById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDrugAlerts', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrugAlertService, req);
    service.GetDrugAlerts(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteDrugAlert', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrugAlertService, req);
    service.DeleteDrugAlert(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
