import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { GuarantorAgreementService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddGuarantorAgreement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorAgreementService, req);
    service.AddGuarantorAgreement(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateGuarantorAgreement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorAgreementService, req);
    service.UpdateGuarantorAgreement(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGuarantorAgreementById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorAgreementService, req);
    service.GetGuarantorAgreementById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGuarantorAgreements', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorAgreementService, req);
    service.GetGuarantorAgreements(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteGuarantorAgreement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorAgreementService, req);
    service.DeleteGuarantorAgreement(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
