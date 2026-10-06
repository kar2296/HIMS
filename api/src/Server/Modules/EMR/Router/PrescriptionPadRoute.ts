import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { PrescriptionPadService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddPrescriptionPad',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PrescriptionPadService, req);
        service.AddPrescriptionPad(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdatePrescriptionPad',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PrescriptionPadService, req);
        service.UpdatePrescriptionPad(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
    router.post('/GetPrescriptionPadInfo', (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PrescriptionPadService, req);
        service.GetPrescriptionPadInfo(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetPrescriptionPadById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrescriptionPadService, req);
    service.GetPrescriptionPadById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPrescriptionPads', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrescriptionPadService, req);
    service.GetPrescriptionPads(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePrescriptionPad', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PrescriptionPadService, req);
    service.DeletePrescriptionPad(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
