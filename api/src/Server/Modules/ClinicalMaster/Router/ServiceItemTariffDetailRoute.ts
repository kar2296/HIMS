import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ServiceItemTariffDetailService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddServiceItemTariffDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemTariffDetailService, req);
    service.AddServiceItemTariffDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateServiceItemTariffDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemTariffDetailService, req);
    service.UpdateServiceItemTariffDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageSerivceItemTariffDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemTariffDetailService, req);
    service.ManageSerivceItemTariffDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceItemTariffDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemTariffDetailService, req);
    service.GetServiceItemTariffDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceItemTariffDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemTariffDetailService, req);
    service.GetServiceItemTariffDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteServiceItemTariffDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemTariffDetailService, req);
    service.DeleteServiceItemTariffDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
