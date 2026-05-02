import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PrivilegeCardDetailService } from '../Service/Index';


let router: Router = express.Router();

router.post('/AddPrivilegeCardDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrivilegeCardDetailService, req);
    service.AddPrivilegeCardDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePrivilegeCardDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrivilegeCardDetailService, req);
    service.UpdatePrivilegeCardDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPrivilegeCardDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrivilegeCardDetailService, req);
    service.GetPrivilegeCardDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPrivilegeCardDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrivilegeCardDetailService, req);
    service.GetPrivilegeCardDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePrivilegeCardDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrivilegeCardDetailService, req);
    service.DeletePrivilegeCardDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
