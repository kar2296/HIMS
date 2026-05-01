import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { WardInsuranceTariffService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddWardInsuranceTariff', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardInsuranceTariffService, req);
    service.AddWardInsuranceTariff(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateWardInsuranceTariff', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardInsuranceTariffService, req);
    service.UpdateWardInsuranceTariff(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageWardInsuranceTariff', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardInsuranceTariffService, req);
    service.ManageWardInsuranceTariff(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetWardInsuranceTariffById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardInsuranceTariffService, req);
    service.GetWardInsuranceTariffById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetWardInsuranceTariffs', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardInsuranceTariffService, req);
    service.GetWardInsuranceTariffs(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteWardInsuranceTariff', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardInsuranceTariffService, req);
    service.DeleteWardInsuranceTariff(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
