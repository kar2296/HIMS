import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ModifiedPatientBillsService } from '../Service/Index';
//import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddModifiedPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientBillsService, req);
    service.AddModifiedPatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateModifiedPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientBillsService, req);
    service.UpdateModifiedPatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageModifiedPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientBillsService, req);
    service.ManageModifiedPatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ModifiyPatientBillDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientBillsService, req);
    service.ModifiyPatientBillDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageModifiedOPPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientBillsService, req);
    service.ManageModifiedOPPatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageModifiedPharmacyPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientBillsService, req);
    service.ManageModifiedPharmacyPatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetModifiedPatientBillById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientBillsService, req);
    service.GetModifiedPatientBillById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetModifiedPatientBillsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientBillsService, req);
    service.GetModifiedPatientBillsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetModifiedPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientBillsService, req);
    service.GetModifiedPatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteModifiedPatientBills', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ModifiedPatientBillsService, req);
    service.DeleteModifiedPatientBills(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
