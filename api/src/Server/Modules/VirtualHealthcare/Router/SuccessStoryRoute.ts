import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { SuccessStoryService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';


let router: Router = express.Router();

router.post('/AddSuccessStory',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(SuccessStoryService, req);
        service.AddSuccessStory(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateSuccessStory',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(SuccessStoryService, req);
        service.UpdateSuccessStory(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetSuccessStoryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SuccessStoryService, req);
    service.GetSuccessStoryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
// router.post('/GetAttachmentFile', (req: Request, res: Response, next: NextFunction): any => {
//     const service = ServiceFactory.CreateService(SuccessStoryService, req);
//     service.GetAttachmentFile(req.body)
//         .then((response) => { res.send(response); })
//         .catch(next);
// });
router.post('/GetAttachmentFile', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SuccessStoryService, req);
    service.GetAttachmentFile(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSuccessStorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SuccessStoryService, req);
    service.GetSuccessStorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteSuccessStory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SuccessStoryService, req);
    service.DeleteSuccessStory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
