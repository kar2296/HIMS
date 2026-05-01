import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientStockReturnDetailsService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddPatientStockReturnDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockReturnDetailsService, req);
    service.AddPatientStockReturnDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientStockReturnDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockReturnDetailsService, req);
    service.UpdatePatientStockReturnDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientStockReturnDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockReturnDetailsService, req);
    service.GetPatientStockReturnDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientStockReturnDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockReturnDetailsService, req);
    service.GetPatientStockReturnDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientStockReturnDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientStockReturnDetailsService, req);
    service.DeletePatientStockReturnDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
