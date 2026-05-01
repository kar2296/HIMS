import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PositionBpChartService} from '../Service/Index';
import { unlinkSync } from 'fs';
let router: Router = express.Router();

router.post('/AddPositionBpChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PositionBpChartService, req);
    service.AddPositionBpChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePositionBpChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PositionBpChartService, req);
    service.UpdatePositionBpChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPositionBpChartById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PositionBpChartService, req);
    service.GetPositionBpChartById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPositionBpCharts', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PositionBpChartService, req);
    service.GetPositionBpCharts(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePositionBpChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PositionBpChartService, req);
    service.DeletePositionBpChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPositionBpChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PositionBpChartService, req);
    service.PrintPositionBpChart(req.body)
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
router.post('/PrintPositionBpChartWithoutHeader', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PositionBpChartService, req);
    service.PrintPositionBpChartWithoutHeader(req.body)
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
