import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { NoteTemplateService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddNoteTemplate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(NoteTemplateService, req);
    service.AddNoteTemplate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateNoteTemplate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(NoteTemplateService, req);
    service.UpdateNoteTemplate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetNoteTemplateById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(NoteTemplateService, req);
    service.GetNoteTemplateById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetNoteTemplates', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(NoteTemplateService, req);
    service.GetNoteTemplates(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteNoteTemplate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(NoteTemplateService, req);
    service.DeleteNoteTemplate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
