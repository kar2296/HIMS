import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DrugFrequencyService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddDrugFrequency', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrugFrequencyService, req);
    service.AddDrugFrequency(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDrugFrequency', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrugFrequencyService, req);
    service.UpdateDrugFrequency(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDrugFrequencyById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrugFrequencyService, req);
    service.GetDrugFrequencyById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDrugFrequencys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrugFrequencyService, req);
    service.GetDrugFrequencys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteDrugFrequency', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrugFrequencyService, req);
    service.DeleteDrugFrequency(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
