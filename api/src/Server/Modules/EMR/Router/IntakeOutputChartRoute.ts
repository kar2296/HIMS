import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { IntakeOutputChartService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddIntakeOutputChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IntakeOutputChartService, req);
    service.AddIntakeOutputChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateIntakeOutputChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IntakeOutputChartService, req);
    service.UpdateIntakeOutputChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIntakeOutputChartById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IntakeOutputChartService, req);
    service.GetIntakeOutputChartById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetIntakeOutputCharts', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IntakeOutputChartService, req);
    service.GetIntakeOutputCharts(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteIntakeOutputChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IntakeOutputChartService, req);
    service.DeleteIntakeOutputChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintIntakeOutputChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IntakeOutputChartService, req);
    service.PrintIntakeOutputChart(req.body)
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
router.post('/PrintIntakeOutputChartWithoutHeader', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(IntakeOutputChartService, req);
    service.PrintIntakeOutputChartWithoutHeader(req.body)
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
