import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { CountryMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddCountryMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CountryMasterService, req);
    service.AddCountryMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCountryMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CountryMasterService, req);
    service.UpdateCountryMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCountryMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CountryMasterService, req);
    service.GetCountryMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCountryMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CountryMasterService, req);
    service.GetCountryMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteCountryMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CountryMasterService, req);
    service.DeleteCountryMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
