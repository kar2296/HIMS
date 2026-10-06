import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { DrugMasterService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddDrugMaster',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(DrugMasterService, req);
        service.AddDrugMaster(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateDrugMaster',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(DrugMasterService, req);
        service.UpdateDrugMaster(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetMaxId', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrugMasterService, req);
    service.GetMaxId(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDrugMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrugMasterService, req);
    service.GetDrugMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDrugMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrugMasterService, req);
    service.GetDrugMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteDrugMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrugMasterService, req);
    service.DeleteDrugMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/MapDiagnosiss', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrugMasterService, req);
    service.MapDiagnosiss(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDiagnosiss', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrugMasterService, req);
    service.GetDiagnosiss(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDrugLogo', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DrugMasterService, req);
    service.GetDrugLogo(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
