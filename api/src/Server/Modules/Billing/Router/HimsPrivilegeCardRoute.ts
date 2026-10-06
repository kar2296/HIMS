import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PrivilegeCardService } from '../Service/Index';


let router: Router = express.Router();

router.post('/AddPrivilegeCard', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrivilegeCardService, req);
    service.AddPrivilegeCard(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePrivilegeCard', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrivilegeCardService, req);
    service.UpdatePrivilegeCard(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPrivilegeCardById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrivilegeCardService, req);
    service.GetPrivilegeCardById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPrivilegeCards', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrivilegeCardService, req);
    service.GetPrivilegeCards(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePrivilegeCard', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrivilegeCardService, req);
    service.DeletePrivilegeCard(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
