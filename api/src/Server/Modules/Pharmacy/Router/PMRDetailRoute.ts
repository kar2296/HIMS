import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PMRDetailService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPMRDetail',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PMRDetailService, req);
        service.AddPMRDetail(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdatePMRDetail',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PMRDetailService, req);
        service.UpdatePMRDetail(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetPMRDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PMRDetailService, req);
    service.GetPMRDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPMRDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PMRDetailService, req);
    service.GetPMRDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePMRDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PMRDetailService, req);
    service.DeletePMRDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
