import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { OpticalGrnDetailService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddOpticalGrnDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalGrnDetailService, req);
    service.AddOpticalGrnDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateOpticalGrnDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalGrnDetailService, req);
    service.UpdateOpticalGrnDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOpticalGrnDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalGrnDetailService, req);
    service.GetOpticalGrnDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOpticalGrnDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalGrnDetailService, req);
    service.GetOpticalGrnDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteOpticalGrnDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OpticalGrnDetailService, req);
    service.DeleteOpticalGrnDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
