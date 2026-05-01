import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { GuarantorSupplementaryService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddGuarantorSupplementary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorSupplementaryService, req);
    service.AddGuarantorSupplementary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateGuarantorSupplementary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorSupplementaryService, req);
    service.UpdateGuarantorSupplementary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageGuarantorSupplementary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorSupplementaryService, req);
    service.ManageGuarantorSupplementary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGuarantorSupplementaryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorSupplementaryService, req);
    service.GetGuarantorSupplementaryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGuarantorSupplementarys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorSupplementaryService, req);
    service.GetGuarantorSupplementarys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteGuarantorSupplementary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorSupplementaryService, req);
    service.DeleteGuarantorSupplementary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
