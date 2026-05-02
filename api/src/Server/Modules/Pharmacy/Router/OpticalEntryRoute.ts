import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { OpticalEntryService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddOpticalEntry', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalEntryService, req);
    service.AddOpticalEntry(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateOpticalEntry', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalEntryService, req);
    service.UpdateOpticalEntry(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOpticalEntryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalEntryService, req);
    service.GetOpticalEntryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOpticalEntrys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalEntryService, req);
    service.GetOpticalEntrys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteOpticalEntry', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalEntryService, req);
    service.DeleteOpticalEntry(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
