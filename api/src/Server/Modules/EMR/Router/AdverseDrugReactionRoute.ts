import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { AdverseDrugReactionService } from '../Service/Index';
import { unlinkSync } from 'fs';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddAdverseDrugReaction', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AdverseDrugReactionService, req);
    service.AddAdverseDrugReaction(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAdverseDrugReaction', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AdverseDrugReactionService, req);
    service.UpdateAdverseDrugReaction(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UploadAttachment',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(AdverseDrugReactionService, req);
        service.UploadAttachment(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetViewAttachment1', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AdverseDrugReactionService, req);
    service.GetViewAttachment1(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetViewAttachment2', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AdverseDrugReactionService, req);
    service.GetViewAttachment2(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAttachment1File', (req: Request, res: Response, next: NextFunction): any => {
    res.download(req.body.Data.Attachment1);
});
router.post('/GetAttachment2File', (req: Request, res: Response, next: NextFunction): any => {
    res.download(req.body.Data.Attachment2);
});
router.post('/GetAdverseDrugReactionById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AdverseDrugReactionService, req);
    service.GetAdverseDrugReactionById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAdverseDrugReactions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AdverseDrugReactionService, req);
    service.GetAdverseDrugReactions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintAdverseDrugReaction', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AdverseDrugReactionService, req);
    service.PrintAdverseDrugReaction(req.body)
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
router.post('/DeleteAdverseDrugReaction', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AdverseDrugReactionService, req);
    service.DeleteAdverseDrugReaction(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
