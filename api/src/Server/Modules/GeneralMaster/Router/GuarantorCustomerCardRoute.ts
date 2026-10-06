import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { GuarantorCustomerCardService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddGuarantorCustomerCard', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorCustomerCardService, req);
    service.AddGuarantorCustomerCard(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateGuarantorCustomerCard', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorCustomerCardService, req);
    service.UpdateGuarantorCustomerCard(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGuarantorCustomerCardById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorCustomerCardService, req);
    service.GetGuarantorCustomerCardById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGuarantorCustomerCards', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorCustomerCardService, req);
    service.GetGuarantorCustomerCards(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteGuarantorCustomerCard', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorCustomerCardService, req);
    service.DeleteGuarantorCustomerCard(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
