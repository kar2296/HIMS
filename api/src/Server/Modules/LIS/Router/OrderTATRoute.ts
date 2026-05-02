import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { OrderTATService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddOrderTAT', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrderTATService, req);
    service.AddOrderTAT(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateOrderTAT', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrderTATService, req);
    service.UpdateOrderTAT(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOrderTATById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrderTATService, req);
    service.GetOrderTATById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOrderTATs', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrderTATService, req);
    service.GetOrderTATs(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteOrderTAT', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrderTATService, req);
    service.DeleteOrderTAT(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintOrdertatReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrderTATService, req);
    service.PrintOrdertatReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});

router.post('/PrintRadOrdertatReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OrderTATService, req);
    service.PrintRadOrdertatReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});

export default router;
