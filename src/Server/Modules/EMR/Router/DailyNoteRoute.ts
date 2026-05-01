import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DailyNoteService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddDailyNote', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DailyNoteService, req);
    service.AddDailyNote(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDailyNote', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DailyNoteService, req);
    service.UpdateDailyNote(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDailyNoteById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DailyNoteService, req);
    service.GetDailyNoteById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDailyNotes', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DailyNoteService, req);
    service.GetDailyNotes(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteDailyNote', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DailyNoteService, req);
    service.DeleteDailyNote(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintDailyNotes', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DailyNoteService, req);
    service.PrintDailyNotes(req.body)
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
