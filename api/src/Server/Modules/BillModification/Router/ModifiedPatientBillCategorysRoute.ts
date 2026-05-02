import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ModifiedPatientBillCategorysService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddModifiedPatientBillCategorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientBillCategorysService, req);
    service.AddModifiedPatientBillCategorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateModifiedPatientBillCategorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientBillCategorysService, req);
    service.UpdateModifiedPatientBillCategorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetModifiedPatientBillCategorysById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientBillCategorysService, req);
    service.GetModifiedPatientBillCategorysById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetModifiedPatientBillCategorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientBillCategorysService, req);
    service.GetModifiedPatientBillCategorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteModifiedPatientBillCategorys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientBillCategorysService, req);
    service.DeleteModifiedPatientBillCategorys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AcutalPrintPatientBillSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientBillCategorysService, req);
    service.AcutalPrintPatientBillSummary(req.body)
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
