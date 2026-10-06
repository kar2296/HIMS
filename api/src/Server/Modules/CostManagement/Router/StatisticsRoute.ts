import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { StatisticsService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();
router.post('/AddStatistics',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(StatisticsService, req);
        service.AddStatistics(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateStatistics',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(StatisticsService, req);
        service.UpdateStatistics(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetStatisticsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StatisticsService, req);
    service.GetStatisticsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStatisticss', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StatisticsService, req);
    service.GetStatisticss(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStatistics', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StatisticsService, req);
    service.DeleteStatistics(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
