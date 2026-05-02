import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { GuarantorGSTService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddGuarantorGST', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorGSTService, req);
    service.AddGuarantorGST(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateGuarantorGST', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorGSTService, req);
    service.UpdateGuarantorGST(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGuarantorGSTById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorGSTService, req);
    service.GetGuarantorGSTById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGuarantorGSTs', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorGSTService, req);
    service.GetGuarantorGSTs(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteGuarantorGST', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorGSTService, req);
    service.DeleteGuarantorGST(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
