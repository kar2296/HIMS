import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { BannerContentService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';


let router: Router = express.Router();

router.post('/AddBannerContent',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(BannerContentService, req);
        service.AddBannerContent(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateBannerContent',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(BannerContentService, req);
        service.UpdateBannerContent(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetBannerContentById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BannerContentService, req);
    service.GetBannerContentById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAttachmentFile', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BannerContentService, req);
    service.GetAttachmentFile(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
// router.post('/GetAttachmentFile', (req: Request, res: Response, next: NextFunction): any => {
//     res.download(req.body.Data.Attachment);
// });
router.post('/GetBannerContents', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BannerContentService, req);
    service.GetBannerContents(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteBannerContent', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BannerContentService, req);
    service.DeleteBannerContent(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
