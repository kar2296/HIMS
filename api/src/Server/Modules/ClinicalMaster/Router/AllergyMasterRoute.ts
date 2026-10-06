import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AllergyMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddAllergyMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AllergyMasterService, req);
    service.AddAllergyMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAllergyMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AllergyMasterService, req);
    service.UpdateAllergyMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAllergyMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AllergyMasterService, req);
    service.GetAllergyMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAllergyMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AllergyMasterService, req);
    service.GetAllergyMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAllergyMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AllergyMasterService, req);
    service.DeleteAllergyMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
