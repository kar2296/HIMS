import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { GuarantorCardTypeService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddGuarantorCardType', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorCardTypeService, req);
    service.AddGuarantorCardType(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateGuarantorCardType', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorCardTypeService, req);
    service.UpdateGuarantorCardType(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGuarantorCardTypeById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorCardTypeService, req);
    service.GetGuarantorCardTypeById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGuarantorCardTypes', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorCardTypeService, req);
    service.GetGuarantorCardTypes(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteGuarantorCardType', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorCardTypeService, req);
    service.DeleteGuarantorCardType(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSelfGuarantorCardType', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorCardTypeService, req);
    service.GetSelfGuarantorCardType(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
