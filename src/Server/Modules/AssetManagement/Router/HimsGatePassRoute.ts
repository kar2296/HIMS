import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { GatePassService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddGatePass',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(GatePassService, req);
        service.AddGatePass(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateGatePass', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GatePassService, req);
    service.UpdateGatePass(req.body)
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
router.post('/GetGatePassById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GatePassService, req);
    service.GetGatePassById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGatePasss', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GatePassService, req);
    service.GetGatePasss(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteGatePass', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GatePassService, req);
    service.DeleteGatePass(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintGatePass', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GatePassService, req);
    service.PrintGatePass(req.body)
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
router.post('/PrintGatePass1', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GatePassService, req);
    service.PrintGatePass1(req.body)
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
router.post('/PrintAssetGatepassReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GatePassService, req);
    service.PrintAssetGatepassReport(req.body)
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
