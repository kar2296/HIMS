import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { OtPatientEquipmentsService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddOtPatientEquipments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtPatientEquipmentsService, req);
    service.AddOtPatientEquipments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateOtPatientEquipments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtPatientEquipmentsService, req);
    service.UpdateOtPatientEquipments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOtPatientEquipmentsById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtPatientEquipmentsService, req);
    service.GetOtPatientEquipmentsById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageOtPatientEquipments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtPatientEquipmentsService, req);
    service.ManageOtPatientEquipments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOtPatientEquipmentss', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtPatientEquipmentsService, req);
    service.GetOtPatientEquipmentss(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteOtPatientEquipments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtPatientEquipmentsService, req);
    service.DeleteOtPatientEquipments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintOtPatientEquipments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtPatientEquipmentsService, req);
    service.PrintOtPatientEquipments(req.body)
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
