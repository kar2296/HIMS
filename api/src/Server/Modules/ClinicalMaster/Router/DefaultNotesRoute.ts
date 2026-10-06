import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DefaultNotesService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddDefaultNotes', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DefaultNotesService, req);
    service.AddDefaultNotes(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDefaultNotes', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DefaultNotesService, req);
    service.UpdateDefaultNotes(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDefaultNotesById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DefaultNotesService, req);
    service.GetDefaultNotesById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDefaultNotess', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DefaultNotesService, req);
    service.GetDefaultNotess(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteDefaultNotes', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DefaultNotesService, req);
    service.DeleteDefaultNotes(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
