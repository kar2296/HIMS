import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ExaminationMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddExaminationMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ExaminationMasterService, req);
    service.AddExaminationMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateExaminationMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ExaminationMasterService, req);
    service.UpdateExaminationMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetExaminationMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ExaminationMasterService, req);
    service.GetExaminationMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetExaminationMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ExaminationMasterService, req);
    service.GetExaminationMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteExaminationMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ExaminationMasterService, req);
    service.DeleteExaminationMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
