import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AttachmentTypeService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddAttachmentType', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AttachmentTypeService, req);
    service.AddAttachmentType(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAttachmentType', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AttachmentTypeService, req);
    service.UpdateAttachmentType(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAttachmentTypeById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AttachmentTypeService, req);
    service.GetAttachmentTypeById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAttachmentTypes', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AttachmentTypeService, req);
    service.GetAttachmentTypes(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAttachmentType', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AttachmentTypeService, req);
    service.DeleteAttachmentType(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
