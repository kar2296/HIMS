import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { OtNotesService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddOtNotes', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtNotesService, req);
    service.AddOtNotes(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateOtNotes', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtNotesService, req);
    service.UpdateOtNotes(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOtNotesById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtNotesService, req);
    service.GetOtNotesById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOtNotess', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtNotesService, req);
    service.GetOtNotess(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteOtNotes', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtNotesService, req);
    service.DeleteOtNotes(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
