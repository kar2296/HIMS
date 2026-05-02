import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DrugFrequencyCategoryService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddDrugFrequencyCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrugFrequencyCategoryService, req);
    service.AddDrugFrequencyCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDrugFrequencyCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrugFrequencyCategoryService, req);
    service.UpdateDrugFrequencyCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDrugFrequencyCategoryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrugFrequencyCategoryService, req);
    service.GetDrugFrequencyCategoryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDrugFrequencyCategorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrugFrequencyCategoryService, req);
    service.GetDrugFrequencyCategorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteDrugFrequencyCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrugFrequencyCategoryService, req);
    service.DeleteDrugFrequencyCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
