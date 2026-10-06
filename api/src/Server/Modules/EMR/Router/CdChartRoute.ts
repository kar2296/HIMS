import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { CdChartService} from '../Service/Index';
import { unlinkSync } from 'fs';
let router: Router = express.Router();

router.post('/AddCdChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CdChartService, req);
    service.AddCdChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCdChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CdChartService, req);
    service.UpdateCdChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCdChartById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CdChartService, req);
    service.GetCdChartById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCdCharts', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CdChartService, req);
    service.GetCdCharts(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteCdChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CdChartService, req);
    service.DeleteCdChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintCdChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CdChartService, req);
    service.PrintCdChart(req.body)
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
router.post('/PrintCdChartWithoutHeader', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CdChartService, req);
    service.PrintCdChartWithoutHeader(req.body)
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
