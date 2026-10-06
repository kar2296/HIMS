import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { CostDetailService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddCostDetail',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(CostDetailService, req);
        service.AddCostDetail(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateCostDetail',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(CostDetailService, req);
        service.UpdateCostDetail(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetCostDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CostDetailService, req);
    service.GetCostDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCostDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CostDetailService, req);
    service.GetCostDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteCostDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CostDetailService, req);
    service.DeleteCostDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
