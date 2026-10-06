import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { RISInterfaceResultService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddRISInterfaceResult', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RISInterfaceResultService, req);
    service.AddRISInterfaceResult(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateRISInterfaceResult', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RISInterfaceResultService, req);
    service.UpdateRISInterfaceResult(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRISInterfaceResultById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RISInterfaceResultService, req);
    service.GetRISInterfaceResultById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRISInterfaceResults', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RISInterfaceResultService, req);
    service.GetRISInterfaceResults(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteRISInterfaceResult', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(RISInterfaceResultService, req);
    service.DeleteRISInterfaceResult(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
