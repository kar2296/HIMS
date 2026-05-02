import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { GenericMasterService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddGenericMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GenericMasterService, req);
    service.AddGenericMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateGenericMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GenericMasterService, req);
    service.UpdateGenericMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMaxId', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GenericMasterService, req);
    service.GetMaxId(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGenericMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GenericMasterService, req);
    service.GetGenericMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGenericMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GenericMasterService, req);
    service.GetGenericMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteGenericMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GenericMasterService, req);
    service.DeleteGenericMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintGenericMasterReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GenericMasterService, req);
    service.PrintGenericMasterReport(req.body)
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
