import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ModifiedPatientBillCategoryDetailsService } from '../Service/Index';
//import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddModifiedPatientBillCategoryDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientBillCategoryDetailsService, req);
    service.AddModifiedPatientBillCategoryDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateModifiedPatientBillCategoryDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientBillCategoryDetailsService, req);
    service.UpdateModifiedPatientBillCategoryDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetModifiedPatientBillCategoryDetailsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientBillCategoryDetailsService, req);
    service.GetModifiedPatientBillCategoryDetailsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetModifiedPatientBillCategoryDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientBillCategoryDetailsService, req);
    service.GetModifiedPatientBillCategoryDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteModifiedPatientBillCategoryDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientBillCategoryDetailsService, req);
    service.DeleteModifiedPatientBillCategoryDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
