import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { LinenItemMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddLinenItemMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenItemMasterService, req);
    service.AddLinenItemMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateLinenItemMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenItemMasterService, req);
    service.UpdateLinenItemMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLinenItemMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenItemMasterService, req);
    service.GetLinenItemMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetLinenItemMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenItemMasterService, req);
    service.GetLinenItemMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteLinenItemMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LinenItemMasterService, req);
    service.DeleteLinenItemMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
