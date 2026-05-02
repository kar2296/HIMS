import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { LISInterfaceResultsService } from '../Service/Index';
let router: Router = express.Router();

router.post('/AddLISResult', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LISInterfaceResultsService, req);
    service.AddLISResult(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateLISResult', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LISInterfaceResultsService, req);
    service.UpdateLISResult(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/GetLISResultsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LISInterfaceResultsService, req);
    service.GetLISResultsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/GetLISResults', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LISInterfaceResultsService, req);
    service.GetLISResults(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/GetLISResultsWithoutGroup', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LISInterfaceResultsService, req);
    service.GetLISResultsWithoutGroup(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/DeleteLISResults', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LISInterfaceResultsService, req);
    service.DeleteLISResults(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
