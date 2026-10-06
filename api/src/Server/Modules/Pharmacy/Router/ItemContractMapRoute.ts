import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { ItemContractMapService} from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddItemContractMap',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(ItemContractMapService, req);
        service.AddItemContractMap(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateItemContractMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemContractMapService, req);
    service.UpdateItemContractMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDocumentFile', (req: Request, res: Response, next: NextFunction): any => {
    //const service = ServiceFactory.CreateService(PatientAttachmentService, req);
    res.download(req.body.Data.FilePath);
/*
    service.GetAttachmentFile(req.body, res)
        .then((response) => { res.send(response); })
        .catch(next);
        */
});
router.post('/GetItemContractMapById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemContractMapService, req);
    service.GetItemContractMapById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemContractMaps', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemContractMapService, req);
    service.GetItemContractMaps(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteItemContractMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemContractMapService, req);
    service.DeleteItemContractMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
