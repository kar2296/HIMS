import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { EncounterMLCService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddEncounterMLC', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterMLCService, req);
    service.AddEncounterMLC(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateEncounterMLC', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterMLCService, req);
    service.UpdateEncounterMLC(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEncounterMLCById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterMLCService, req);
    service.GetEncounterMLCById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEncounterMLCs', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterMLCService, req);
    service.GetEncounterMLCs(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAccidentMLC', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterMLCService, req);
    service.GetAccidentMLC(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteEncounterMLC', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterMLCService, req);
    service.DeleteEncounterMLC(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintEncounterMLC', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(EncounterMLCService, req);
    service.PrintEncounterMLC(req.body)
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
export default router;
