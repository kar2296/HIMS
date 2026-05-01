import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { MRDFilesService } from '../Service/Index';
import { unlinkSync } from 'fs';


let router: Router = express.Router();

router.post('/AddMRDFiles', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MRDFilesService, req);
    service.AddMRDFiles(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateMRDFiles', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MRDFilesService, req);
    service.UpdateMRDFiles(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMRDFilesById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MRDFilesService, req);
    service.GetMRDFilesById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMRDFiless', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MRDFilesService, req);
    service.GetMRDFiless(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteMRDFiles', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MRDFilesService, req);
    service.DeleteMRDFiles(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintMrdFileSubmittedReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(MRDFilesService, req);
    service.PrintMrdFileSubmittedReport(req.body)
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
