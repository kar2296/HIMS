import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PincodeMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPincodeMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PincodeMasterService, req);
    service.AddPincodeMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePincodeMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PincodeMasterService, req);
    service.UpdatePincodeMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPincodeMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PincodeMasterService, req);
    service.GetPincodeMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPincodeMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PincodeMasterService, req);
    service.GetPincodeMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePincodeMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PincodeMasterService, req);
    service.DeletePincodeMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
