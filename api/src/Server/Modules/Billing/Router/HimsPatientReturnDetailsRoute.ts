import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientReturnDetailsService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientReturnDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnDetailsService, req);
    service.AddPatientReturnDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientReturnDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnDetailsService, req);
    service.UpdatePatientReturnDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientReturnDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnDetailsService, req);
    service.GetPatientReturnDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientReturnDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnDetailsService, req);
    service.GetPatientReturnDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientReturnDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnDetailsService, req);
    service.DeletePatientReturnDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/SaleReturnGSTDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnDetailsService, req);
    service.SaleReturnGSTDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintSaleReturnGST', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnDetailsService, req);
    service.PrintSaleReturnGST(req.body)
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
router.post('/PrintPatientReturnDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientReturnDetailsService, req);
    service.PrintPatientReturnDetails(req.body)
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
