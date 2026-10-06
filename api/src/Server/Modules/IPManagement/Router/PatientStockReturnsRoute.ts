import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientStockReturnsService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientStockReturns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockReturnsService, req);
    service.AddPatientStockReturns(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientStockReturns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockReturnsService, req);
    service.UpdatePatientStockReturns(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientStockReturnsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockReturnsService, req);
    service.GetPatientStockReturnsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientStockReturns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockReturnsService, req);
    service.GetPatientStockReturns(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientStockReturns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockReturnsService, req);
    service.DeletePatientStockReturns(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/RejectPatientStockReturns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockReturnsService, req);
    service.RejectPatientStockReturns(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientStockReturns', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockReturnsService, req);
    service.PrintPatientStockReturns(req.body)
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

router.post('/CompletePatientStockReturn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockReturnsService, req);
    service.CompletePatientStockReturn(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
