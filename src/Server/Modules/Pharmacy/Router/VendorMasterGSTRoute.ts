import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { VendorMasterGSTService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddVendorMasterGST', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterGSTService, req);
    service.AddVendorMasterGST(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateVendorMasterGST', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterGSTService, req);
    service.UpdateVendorMasterGST(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVendorMasterGSTById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterGSTService, req);
    service.GetVendorMasterGSTById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVendorMasterGSTs', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterGSTService, req);
    service.GetVendorMasterGSTs(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteVendorMasterGST', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterGSTService, req);
    service.DeleteVendorMasterGST(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
