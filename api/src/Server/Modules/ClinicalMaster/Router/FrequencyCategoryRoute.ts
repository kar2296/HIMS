import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { FrequencyCategoryService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddFrequencyCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FrequencyCategoryService, req);
    service.AddFrequencyCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateFrequencyCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FrequencyCategoryService, req);
    service.UpdateFrequencyCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFrequencyCategoryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FrequencyCategoryService, req);
    service.GetFrequencyCategoryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFrequencyCategorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FrequencyCategoryService, req);
    service.GetFrequencyCategorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteFrequencyCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FrequencyCategoryService, req);
    service.DeleteFrequencyCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
