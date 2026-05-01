import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { ExtravasationProformaService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddExtravasationProforma',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(ExtravasationProformaService, req);
        service.AddExtravasationProforma(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateExtravasationProforma', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ExtravasationProformaService, req);
    service.UpdateExtravasationProforma(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetExtravasationProformaById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ExtravasationProformaService, req);
    service.GetExtravasationProformaById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UploadPhoto',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(ExtravasationProformaService, req);
        service.UploadPhoto(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetExtravasationProformas', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ExtravasationProformaService, req);
    service.GetExtravasationProformas(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAttachment1File', (req: Request, res: Response, next: NextFunction): any => {
    res.download(req.body.Data.PhotoAfterextravasation);
});
router.post('/GetAttachment2File', (req: Request, res: Response, next: NextFunction): any => {
    res.download(req.body.Data.PhotoAfterHealing);
});
router.post('/PrintExtravasationProforma', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ExtravasationProformaService, req);
    service.PrintExtravasationProforma(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
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
router.post('/GetPhotoAfterextravasation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ExtravasationProformaService, req);
    service.GetPhotoAfterextravasation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPhotoAfterHealing', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ExtravasationProformaService, req);
    service.GetPhotoAfterHealing(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteExtravasationProforma', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ExtravasationProformaService, req);
    service.DeleteExtravasationProforma(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
