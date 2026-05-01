import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { CronStatusService} from '../Service/Index';

let router: Router = express.Router();

router.post('/GetCronStatusById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CronStatusService, req);
    service.GetCronStatusById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCronStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CronStatusService, req);
    service.GetCronStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
