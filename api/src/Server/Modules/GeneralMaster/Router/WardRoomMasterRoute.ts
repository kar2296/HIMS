import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { WardRoomMasterService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddWardRoomMaster',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(WardRoomMasterService, req);
        service.AddWardRoomMaster(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateWardRoomMaster',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(WardRoomMasterService, req);
        service.UpdateWardRoomMaster(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
	router.post('/GetRoomLogo', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardRoomMasterService, req);
    service.GetRoomLogo(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetRoomFile', (req: Request, res: Response, next: NextFunction): any => {
    //const service = ServiceFactory.CreateService(PatientAttachmentService, req);
    res.download(req.body.Data.PhotoPath);
/*
    service.GetAttachmentFile(req.body, res)
        .then((response) => { res.send(response); })
        .catch(next);
        */
});
router.post('/GetWardRoomMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardRoomMasterService, req);
    service.GetWardRoomMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetWardRoomMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardRoomMasterService, req);
    service.GetWardRoomMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteWardRoomMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(WardRoomMasterService, req);
    service.DeleteWardRoomMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
