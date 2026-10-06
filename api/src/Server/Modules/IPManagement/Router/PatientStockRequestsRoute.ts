import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientStockRequestsService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientStockRequests', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockRequestsService, req);
    service.AddPatientStockRequests(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientStockRequests', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockRequestsService, req);
    service.UpdatePatientStockRequests(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/CompletePatientStockRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockRequestsService, req);
    service.CompletePatientStockRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/RejectPatientStockRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockRequestsService, req);
    service.RejectPatientStockRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientStockRequestsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockRequestsService, req);
    service.GetPatientStockRequestsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPendingIndents', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockRequestsService, req);
    service.GetPendingIndents(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientStockRequests', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockRequestsService, req);
    service.GetPatientStockRequests(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientWorkLists', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockRequestsService, req);
    service.GetPatientWorkLists(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientStockRequestsList', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockRequestsService, req);
    service.GetPatientStockRequestsList(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientStockRequests', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockRequestsService, req);
    service.DeletePatientStockRequests(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientStockRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockRequestsService, req);
    service.PrintPatientStockRequest(req.body)
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
router.post('/PrintPatientStockReceive', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockRequestsService, req);
    service.PrintPatientStockReceive(req.body)
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
router.post('/PrintPatientMedicineReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockRequestsService, req);
    service.PrintPatientMedicineReport(req.body)
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
